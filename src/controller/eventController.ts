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