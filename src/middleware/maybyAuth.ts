// src/middleware/maybeAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function attachUserIfPresent(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  // Proveri da je header string i da počinje sa "Bearer "
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim(); // bez "Bearer "
    if (token) {
      const decoded = verifyToken(token); // verifyToken(token: string)
      if (decoded) {
        // isti shape kao u authenticateToken
        req.user = decoded as any;
      }
    }
  }

  next();
}
