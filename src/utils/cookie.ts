// middleware/visitorCookie.ts
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function ensureVisitorId(req: Request, res: Response, next: NextFunction) {
  let visitorId = req.cookies?.visitorId;

  if (!visitorId) {
    visitorId = uuidv4();
    res.cookie("visitorId", visitorId, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dana
    });
  }

  (req as any).visitorId = visitorId;
  next();
}
