// src/controller/publicRsvpController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Event } from "../model/eventModel";
import { RSVP } from "../model/rsvpModel";
import { User } from "../model/userModel";

const eventRepo = AppDataSource.getRepository(Event);
const rsvpRepo  = AppDataSource.getRepository(RSVP);
const userRepo  = AppDataSource.getRepository(User);

// POST /public/events/:id/rsvp
export async function publicAddRSVP(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) return res.status(400).json({ message: "Invalid event ID" });

    const event = await eventRepo.findOne({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user?.user_id ? Number(req.user.user_id) : null;

    if (userId) {
      const user = await userRepo.findOne({ where: { user_id: userId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      // ako je već prijavljen → odmah vrati
      const already = await rsvpRepo.findOne({ where: { user: { user_id: userId }, event: { id: eventId } } });
      if (already) return res.status(200).json({ message: "Already registered" });

      // proveri kapacitet TEK sada
      const count = await rsvpRepo.count({ where: { event: { id: eventId } } });
      if (typeof event.maxCapacity === "number" && count >= event.maxCapacity) {
        return res.status(409).json({ message: "Event is full" });
      }

      await rsvpRepo.save(rsvpRepo.create({ user, event }));
      return res.status(201).json({ message: "Registered successfully" });
    }

    // GOST
    const { guestName, guestEmail } = (req.body || {}) as { guestName?: string; guestEmail?: string };
    if (!guestName?.trim() || !guestEmail?.trim()) {
      return res.status(400).json({ message: "guestName and guestEmail are required for guest RSVP" });
    }

    // ako je već prijavljen kao gost → odmah vrati
    const alreadyGuest = await rsvpRepo.findOne({ where: { guestEmail: guestEmail.trim(), event: { id: eventId } } });
    if (alreadyGuest) return res.status(200).json({ message: "Already registered" });

    // proveri kapacitet
    const count = await rsvpRepo.count({ where: { event: { id: eventId } } });
    if (typeof event.maxCapacity === "number" && count >= event.maxCapacity) {
      return res.status(409).json({ message: "Event is full" });
    }

    const visitorId = (req as any).visitorId as string | undefined;

    const toSave = rsvpRepo.create({
      event,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      ...(visitorId ? { visitorId } : {}),
    });
    await rsvpRepo.save(toSave);

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062 || err?.code === "SQLITE_CONSTRAINT" || err?.code === "23505") {
      return res.status(200).json({ message: "Already registered" });
    }
    console.error("publicAddRSVP error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /public/events/:id/rsvp   (ulogovani ne šalje ništa; gost šalje guestEmail)
export async function publicRemoveRSVP(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) return res.status(400).json({ message: "Invalid event ID" });

    const userId = req.user?.user_id ? Number(req.user.user_id) : null;
    if (userId) {
      const existing = await rsvpRepo.findOne({ where: { user: { user_id: userId }, event: { id: eventId } } });
      if (!existing) return res.status(200).json({ message: "Not registered" });
      await rsvpRepo.remove(existing);
      return res.status(200).json({ message: "Unregistered successfully" });
    }

    const guestEmail = (req.body?.guestEmail as string) || (req.query.guestEmail as string);
    if (!guestEmail?.trim()) return res.status(400).json({ message: "guestEmail required" });

    const existingGuest = await rsvpRepo.findOne({ where: { guestEmail: guestEmail.trim(), event: { id: eventId } } });
    if (!existingGuest) return res.status(200).json({ message: "Not registered" });
    await rsvpRepo.remove(existingGuest);
    return res.status(200).json({ message: "Unregistered successfully" });
  } catch (err) {
    console.error("publicRemoveRSVP error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /public/events/:id/rsvps/count
export async function publicRSVPCount(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) return res.status(400).json({ message: "Invalid event ID" });

    const count = await rsvpRepo.count({ where: { event: { id: eventId } } });
    return res.json({ eventId, count });
  } catch (err) {
    console.error("publicRSVPCount error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// (opciono) GET /public/events/:id/rsvp/status?guestEmail=
export async function publicRSVPStatus(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) return res.status(400).json({ message: "Invalid event ID" });

    const userId = req.user?.user_id ? Number(req.user.user_id) : null;
    if (userId) {
      const exists = await rsvpRepo.findOne({ where: { user: { user_id: userId }, event: { id: eventId } } });
      return res.json({ registered: !!exists, by: "user" });
    }
    const guestEmail = (req.query.guestEmail as string) || "";
    if (!guestEmail) return res.json({ registered: false, by: "guest" });

    const exists = await rsvpRepo.findOne({ where: { guestEmail: guestEmail.trim(), event: { id: eventId } } });
    return res.json({ registered: !!exists, by: "guest" });
  } catch (err) {
    console.error("publicRSVPStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
