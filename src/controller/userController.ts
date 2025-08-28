import { Request, Response } from 'express';
import { User } from '../model/userModel';
import { generateToken} from '../utils/jwt';
import { AppDataSource } from '../db';
import bcrypt from "bcryptjs"

const userRepository = AppDataSource.getRepository(User);

export async function register(req:Request, res:Response){

}


export async function login(req:Request, res:Response){
    
}