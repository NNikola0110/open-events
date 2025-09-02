import { Request, Response } from 'express';
import { generateToken} from '../utils/jwt';
import { AppDataSource } from '../db';
import bcrypt from "bcryptjs"
import { User } from '../model/userModel';
import { UserCreationSchema } from '../utils/validation';

const userRepository = AppDataSource.getRepository(User);


export async function listOfUsers(req:Request, res:Response){
     try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // make sure values are sane
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100); // max 100 per page

    const [users, total] = await userRepository.findAndCount({
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return res.json({
      data: users,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: safePage * safeLimit < total,
        hasPrevPage: safePage > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function registerUser(req:Request, res:Response){
    try {
    const pareseResult = UserCreationSchema.safeParse(req.body);
    if(!pareseResult.success){
        res.status(400)
        return;
    }

    const { email, username,name, lastname, password, role } = pareseResult.data;

     // 2. Provera da li već postoji email/username
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    // 3. Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Kreiranje novog user-a
    const newUser = userRepository.create({
      email,
      username,
      name,
      lastname,
      password: hashedPassword,
      role: role || "event_creator",
    });

    await userRepository.save(newUser);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }

}

export async function updateUser(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "User ID param is required" });
    }
    const userId = parseInt(idParam);
    if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, lastname, email, role } = req.body;

    if (name) user.name = name;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (role) user.role = role;

    await userRepository.save(user);

    return res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export const updateUserStatus = async (req: Request, res: Response) => {
  try {
     const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "User ID param is required" });
    }
    const userId = parseInt(idParam);
    if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await userRepository.findOneBy({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'event_creator') {
      return res.status(400).json({ message: 'Only event_creators can be activated/deactivated' });
    }

    user.status = !user.status;
    await userRepository.save(user);

    return res.status(200).json({
      message: `User is now ${user.status ? 'active' : 'inactive'}`,
      userId: user.user_id,
      status: user.status,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};