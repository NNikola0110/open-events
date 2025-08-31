import { Request, Response } from 'express';
import { User } from '../model/userModel';
import { generateToken} from '../utils/jwt';
import { AppDataSource } from '../db';
import bcrypt from "bcryptjs"
import {LoginSchema, UserCreationSchema} from "../utils/validation"

const userRepository = AppDataSource.getRepository(User);

export async function register(req:Request, res:Response){
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


export async function login(req:Request, res:Response){
   try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const { username, password} = parseResult.data;

    const existingUser = await userRepository.findOne({
      where: [{ username }],
    });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      user_id: existingUser.user_id,
      username: existingUser.username,
      type: existingUser.role,
    });
    return res.json({ failed: false, token });
}catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
