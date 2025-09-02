import { Request, Response } from 'express';
import { generateToken} from '../utils/jwt';
import { AppDataSource } from '../db';
import bcrypt from "bcryptjs"
import { User } from '../model/userModel';
import { EventSchema, UserCreationSchema } from '../utils/validation';
import { Like } from 'typeorm';
import { Event } from '../model/eventModel';
import { Category } from '../model/categoriModel';
import { Tag } from '../model/tagModel';


const eventRepo = AppDataSource.getRepository(Event);

// GET /ems/events?search=&page=&limit=
export async function getEvents(req: Request, res: Response) {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = search
      ? [
          { title: Like(`%${search}%`) },
          { description: Like(`%${search}%`) }
        ]
      : {};

    const [events, total] = await eventRepo.findAndCount({
      where,
      order: { createDate: "DESC" },
      skip,
      take: limit,
    });

    return res.status(200).json({
      data: events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const categoryRepo = AppDataSource.getRepository(Category);
const tagRepo = AppDataSource.getRepository(Tag);
const userRepo = AppDataSource.getRepository(User);

//export const addEvent = async (req: Request, res: Response) => {
//  try {
//    // 1️⃣ Validacija request body sa Zod
//    const parsed = EventSchema.safeParse(req.body);
//    if (!parsed.success) {
//      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.format() });
//    }
//
//    const { title, description, startsAt, location, maxCapacity, categoryId, tags } = parsed.data;
//
//    // 2️⃣ Dohvati user-a iz middleware-a (req.user.user_id)
//    const userId = req.user?.user_id;
//    if (!userId) {
//      return res.status(401).json({ message: 'Unauthorized: missing user' });
//    }
//
//    const creator = await userRepo.findOneBy({ user_id: userId });
//    if (!creator || !creator.status) {
//      return res.status(401).json({ message: 'Unauthorized: user inactive or not found' });
//    }
//
//    // 3️⃣ Proveri da li postoji kategorija
//    const category = await categoryRepo.findOneBy({ id: Number(categoryId) });
//    if (!category) {
//      return res.status(404).json({ message: 'Category not found' });
//    }
//
//    // 4️⃣ Obradi tagove – kreiraj ako ne postoje
//    let tagEntities: Tag[] = [];
//    if (tags && Array.isArray(tags)) {
//      for (const tagName of tags) {
//        let tag = await tagRepo.findOne({ where: { tagName } });
//        if (!tag) {
//          tag = tagRepo.create({ tagName });
//          await tagRepo.save(tag);
//        }
//        tagEntities.push(tag);
//      }
//    }
//
//    // 5️⃣ Kreiraj novi event
//    const newEvent = eventRepo.create({
//      title,
//      description,
//      eventstartDate: new Date(startsAt),
//      location,
//      maxCapacity: maxCapacity ?? undefined, // koristi undefined umesto null
//      creator,
//      category,
//      tags: tagEntities,
//    });
//
//    
//    await eventRepo.save(newEvent);
//
//    return res.status(201).json({ message: 'Event created successfully', event: newEvent });
//
//  } catch (error) {
//    console.error('Error creating event:', error);
//    return res.status(500).json({ message: 'Internal server error' });
//  }
//};

export const addEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      startsAt,
      location,
      categoryId,
      tags,
      maxCapacity
    } = req.body;

    // Optional: pull authenticated user from middleware
    const userId1 = req.user?.user_id;

   if (!userId1) {
      return res.status(400).json({ message: "User ID param is required" });
    }
    const userId = parseInt(userId1);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    if (!title || !description || !startsAt || !location || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const tagRepo = AppDataSource.getRepository(Tag);
    const categoryRepo = AppDataSource.getRepository(Category);
    const eventRepo = AppDataSource.getRepository(Event);

    const creator = await userRepo.findOneBy({ user_id: userId });
    if (!creator) {
      return res.status(404).json({ error: 'User not found' });
    }

    const category = await categoryRepo.findOneBy({ id: categoryId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Handle tags: find existing or create new ones
    const tagEntities: Tag[] = [];
    if (Array.isArray(tags)) {
      for (const tagName of tags) {
        let tag = await tagRepo.findOneBy({ tagName });
        if (!tag) {
          tag = tagRepo.create({ tagName });
          await tagRepo.save(tag);
        }
        tagEntities.push(tag);
      }
    }

    // Create event
    const event = eventRepo.create({
      title,
      description,
      eventstartDate: new Date(startsAt),
      location,
      category,
      creator,
      tags: tagEntities,
      maxCapacity: maxCapacity ?? null
    });

    await eventRepo.save(event);

    return res.status(201).json({ message: 'Event created successfully', event });

  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



export const updateEvent = async (req: Request, res: Response) => {
  const eventId1 = req.params.id;

   if (!eventId1) {
      return res.status(400).json({ message: "User ID param is required" });
    }
    const eventId = parseInt(eventId1);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

  const {
    title,
    description,
    startsAt,
    location,
    categoryId,
    tags,
    maxCapacity,
  } = req.body;

  // Basic validation
  if (!title || !description || !startsAt || !location || !categoryId || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const tagRepo = AppDataSource.getRepository(Tag);
    const categoryRepo = AppDataSource.getRepository(Category);

    // Find existing event
    const event = await eventRepo.findOne({
      where: { id: eventId },
      relations: ['tags', 'category'],
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Find the category
    const category = await categoryRepo.findOneBy({ id: parseInt(categoryId, 10) });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Process tags
    const tagEntities: Tag[] = [];
    for (const tagName of tags) {
      let tag = await tagRepo.findOneBy({ tagName });
      if (!tag) {
        tag = tagRepo.create({ tagName });
        await tagRepo.save(tag);
      }
      tagEntities.push(tag);
    }

    // Update fields
    event.title = title;
    event.description = description;
    event.eventstartDate = new Date(startsAt);
    event.location = location;
    event.category = category;
    event.tags = tagEntities;
    event.maxCapacity = maxCapacity ?? null;

    await eventRepo.save(event);

    return res.status(200).json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



export const deleteEvent = async (req: Request, res: Response) => {
   const eventId1 = req.params.id;

   if (!eventId1) {
      return res.status(400).json({ message: "Event ID param is required" });
    }
    const eventId = parseInt(eventId1);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
  try {
    const eventRepo = AppDataSource.getRepository(Event);

    const event = await eventRepo.findOneBy({ id: eventId });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await eventRepo.remove(event); // Cascade deletes linked comments (and RSVP if configured)

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



export const getEventbyID = async (req: Request, res: Response) => {
  const eventId1 = req.params.id;

   if (!eventId1) {
      return res.status(400).json({ message: "Event ID param is required" });
    }
    const eventId = parseInt(eventId1);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const eventRepo = AppDataSource.getRepository(Event);

    const event = await eventRepo.findOne({
      where: { id: eventId },
      relations: [
        'creator',
        'category',
        'tags',
        'comment',
        'rsvps',
      ],
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Optional: increase view count
    event.numberOfViews += 1;
    await eventRepo.save(event);

    return res.status(200).json({ event });

  } catch (error) {
    console.error('Error fetching event details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};