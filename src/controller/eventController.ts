import { Request, Response } from 'express';
import { generateToken} from '../utils/jwt';
import { AppDataSource } from '../db';
import bcrypt from "bcryptjs"
import { User } from '../model/userModel';
import { UserCreationSchema } from '../utils/validation';
import { Like } from 'typeorm';
import { Event } from '../model/eventModel';


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