import {z} from 'zod'


export const UserCreationSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8).max(128, "Password must be between 8 and 128 characters")
});

