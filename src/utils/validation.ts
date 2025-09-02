import {email, z} from 'zod'


export const UserCreationSchema = z.object({
  email: z.string(),
  name : z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Lastname is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8).max(128, "Password must be between 8 and 128 characters"),
  role: z.enum(["admin", "event_creator"]).default("event_creator"),
});

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password is too short").max(128, "Password is too long"),
});


export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string(),
});


export const EventSchema =z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  startsAt: z.string(), // ISO datum
  location: z.string().min(2),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string().min(2)).optional(),
  maxCapacity: z.number().int().positive().optional(),
})
