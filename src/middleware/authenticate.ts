 import { Request, Response, NextFunction } from "express";
 import { verifyToken } from "../utils/jwt";


 declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        username: string;
        type: 'admin' | 'event_creator';
      };
    }
  }
}

 export function authenticateToken(req: Request, res:Response, next:NextFunction){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        res.status(401).json({
            failed: true,
            code: 'NOT_AUTHENTICATED'
        });
        return
    }

    const decoded = verifyToken(token)
    if(!decoded){
        res.status(401).json({
            failed: true,
            code: 'NOT_AUTHENTICATED'
        });
        return;
    }

    req.user=decoded;
    next();

 }