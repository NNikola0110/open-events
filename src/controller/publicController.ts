import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Event } from "../model/eventModel";
import { EventView } from "../model/EventViewModel";
import { EventReaction } from "../model/EventReactionModel";
import { Comment as EventComment } from "../model/comentModel";
import { CommentReaction } from "../model/CommentReactionModel";

const eventRepo           = AppDataSource.getRepository(Event);
const viewRepo            = AppDataSource.getRepository(EventView);
const eventReactionRepo   = AppDataSource.getRepository(EventReaction);
const commentRepo         = AppDataSource.getRepository(EventComment);
const commentReactionRepo = AppDataSource.getRepository(CommentReaction);

// GET /public/events/:id
// - vraća detalje događaja
// - upisuje view samo prvi put po posetiocu (po visitorId iz kolačića)
export async function getPublicEventDetails(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid event ID" });

    const event = await eventRepo.findOne({
      where: { id },
      relations: ["category", "tags"],
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const visitorId = (req as any).visitorId as string | undefined;
    if (!visitorId) return res.status(500).json({ message: "Missing visitorId" });

    // Proveri da li je već gledano
    const already = await viewRepo.findOne({
      where: { visitorId, event: { id } },
      relations: ["event"],
    });

    if (!already) {
      // upiši jedinstven view
      const v = viewRepo.create({ visitorId, event });
      await viewRepo.save(v);

      // inkrement broja pregleda na Event tabeli (brzo za listanje)
      event.numberOfViews = (event.numberOfViews ?? 0) + 1;
      await eventRepo.save(event);
    }

    return res.json({ event });
  } catch (err) {
    console.error("getPublicEventDetails error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /public/events/:id/comments?page=&limit=
export async function getPublicComments(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });

    const page  = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);

    const [items, total] = await commentRepo.findAndCount({
      where: { event: { id: eventId } },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getPublicComments error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /public/events/:id/comments
// body: { authorName: string, content: string }
export async function addPublicComment(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });

    const { authorName, content } = req.body as { authorName?: string; content?: string };
    if (!authorName || !content || !authorName.trim() || !content.trim()) {
      return res.status(400).json({ message: "authorName and content are required" });
    }

    const event = await eventRepo.findOne({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const c = commentRepo.create({
      authorName: authorName.trim(),
      content: content.trim(),
      event,
      likeCount: 0,
      dislikeCount: 0,
    });

    await commentRepo.save(c);
    return res.status(201).json({ message: "Comment added", comment: c });
  } catch (err) {
    console.error("addPublicComment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /public/events/:id/reactions
// body: { reactionType: 'like' | 'dislike' }
export async function reactToEvent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid event ID" });

    const { reactionType } = req.body as { reactionType?: "like" | "dislike" };
    if (reactionType !== "like" && reactionType !== "dislike") {
      return res.status(400).json({ message: "reactionType must be 'like' or 'dislike'" });
    }

    const visitorId = (req as any).visitorId as string | undefined;
    if (!visitorId) return res.status(500).json({ message: "Missing visitorId" });

    const event = await eventRepo.findOne({ where: { id } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Proveri da li posetilac već ima reakciju (Unique(visitorId,event))
    let existing = await eventReactionRepo.findOne({
      where: { visitorId, event: { id } },
      relations: ["event"],
    });

    if (!existing) {
      // nova reakcija
      existing = eventReactionRepo.create({ visitorId, reactionType, event });
      await eventReactionRepo.save(existing);

      if (reactionType === "like") event.likeCount = (event.likeCount ?? 0) + 1;
      else                         event.dislikeCount = (event.dislikeCount ?? 0) + 1;

      await eventRepo.save(event);
      return res.status(201).json({
        message: "Reaction recorded",
        likeCount: event.likeCount,
        dislikeCount: event.dislikeCount,
      });
    }

    // već postoji reakcija
    if (existing.reactionType === reactionType) {
      // idempotentno
      return res.json({
        message: "Reaction unchanged",
        likeCount: event.likeCount,
        dislikeCount: event.dislikeCount,
      });
    }

    // promena tipa reakcije (like -> dislike ili obrnuto)
    if (existing.reactionType === "like") {
      event.likeCount = Math.max((event.likeCount ?? 0) - 1, 0);
      event.dislikeCount = (event.dislikeCount ?? 0) + 1;
    } else {
      event.dislikeCount = Math.max((event.dislikeCount ?? 0) - 1, 0);
      event.likeCount = (event.likeCount ?? 0) + 1;
    }

    existing.reactionType = reactionType;
    await eventReactionRepo.save(existing);
    await eventRepo.save(event);

    return res.json({
      message: "Reaction updated",
      likeCount: event.likeCount,
      dislikeCount: event.dislikeCount,
    });
  } catch (err: any) {
    // ako pukne na UNIQUE, vrati informativno
    if (err?.code === "SQLITE_CONSTRAINT" || err?.code === "23505") {
      return res.status(409).json({ message: "Already reacted" });
    }
    console.error("reactToEvent error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /public/comments/:id/reactions
// body: { reactionType: 'like' | 'dislike' }
export async function reactToComment(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid comment ID" });

    const { reactionType } = req.body as { reactionType?: "like" | "dislike" };
    if (reactionType !== "like" && reactionType !== "dislike") {
      return res.status(400).json({ message: "reactionType must be 'like' or 'dislike'" });
    }

    const visitorId = (req as any).visitorId as string | undefined;
    if (!visitorId) return res.status(500).json({ message: "Missing visitorId" });

    const comment = await commentRepo.findOne({ where: { id } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    let existing = await commentReactionRepo.findOne({ where: { visitorId, comment: { id } }, relations: ["comment"] });

    if (!existing) {
      existing = commentReactionRepo.create({ visitorId, reactionType, comment });
      await commentReactionRepo.save(existing);

      if (reactionType === "like") comment.likeCount = (comment.likeCount ?? 0) + 1;
      else                         comment.dislikeCount = (comment.dislikeCount ?? 0) + 1;

      await commentRepo.save(comment);
      return res.status(201).json({
        message: "Reaction recorded",
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
      });
    }

    if (existing.reactionType === reactionType) {
      return res.json({
        message: "Reaction unchanged",
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
      });
    }

    if (existing.reactionType === "like") {
      comment.likeCount = Math.max((comment.likeCount ?? 0) - 1, 0);
      comment.dislikeCount = (comment.dislikeCount ?? 0) + 1;
    } else {
      comment.dislikeCount = Math.max((comment.dislikeCount ?? 0) - 1, 0);
      comment.likeCount = (comment.likeCount ?? 0) + 1;
    }

    existing.reactionType = reactionType;
    await commentReactionRepo.save(existing);
    await commentRepo.save(comment);

    return res.json({
      message: "Reaction updated",
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount,
    });
  } catch (err: any) {
    if (err?.code === "SQLITE_CONSTRAINT" || err?.code === "23505") {
      return res.status(409).json({ message: "Already reacted" });
    }
    console.error("reactToComment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}




export async function getTop(req: Request, res: Response) {
  try {
    const rawDays  = Number(req.query.days ?? 30);
    const rawLimit = Number(req.query.limit ?? 10);

    const days  = Number.isFinite(rawDays)  ? Math.max(1, Math.min(rawDays, 365)) : 30;
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 50)) : 10;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Aggregacija pregleda iz EventView u periodu
    // SELECT e.id, e.title, ..., COUNT(v.id) AS viewsInPeriod
    // FROM EventView v LEFT JOIN Event e ON v.eventId=e.id
    // WHERE v.createdAt >= :since
    // GROUP BY e.id
    // ORDER BY viewsInPeriod DESC
    // LIMIT :limit
    const rows = await viewRepo
      .createQueryBuilder("v")
      .leftJoin("v.event", "e")
      .where("v.createdAt >= :since", { since })
      .select("e.id", "id")
      .addSelect("e.title", "title")
      .addSelect("e.description", "description")
      .addSelect("e.eventstartDate", "eventstartDate")
      .addSelect("e.location", "location")
      .addSelect("e.numberOfViews", "totalViews")   // ukupno (lifetime), informativno
      .addSelect("e.likeCount", "likeCount")
      .addSelect("e.dislikeCount", "dislikeCount")
      .addSelect("COUNT(v.id)", "viewsInPeriod")
      .groupBy("e.id")
      .orderBy("viewsInPeriod", "DESC")
      .limit(limit)
      .getRawMany<{
        id: number;
        title: string;
        description: string;
        eventstartdate: string; // napomena: MySQL može vratiti lower-cased alias
        eventstartDate?: string;
        location: string;
        totalviews: string;
        likecount: string;
        dislikecount: string;
        viewsinperiod: string;
      }>();

    const data = rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      description: r.description,
      eventstartDate: (r as any).eventstartDate ?? (r as any).eventstartdate ?? null,
      location: r.location,
      likeCount: Number(r.likecount ?? 0),
      dislikeCount: Number(r.dislikecount ?? 0),
      totalViews: Number(r.totalviews ?? 0),      // lifetime
      viewsInPeriod: Number(r.viewsinperiod ?? 0) // u zadnjih N dana
    }));

    return res.json({
      data,
      meta: {
        days,
        since: since.toISOString(),
        limit
      }
    });
  } catch (err) {
    console.error("getTopEvents error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
