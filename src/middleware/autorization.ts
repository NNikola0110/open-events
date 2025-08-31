import { Request, Response, NextFunction } from "express";

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.type !== "admin") {
    return res.status(403).json({ message: "Pristup dozvoljen samo adminima." });
  }
  next();
}


export function isEventCreator(req: Request, res: Response, next: NextFunction) {
  if (req.user?.type !== "event_creator") {
    return res.status(403).json({ message: "Pristup dozvoljen samo organizatorima događaja." });
  }
  next();
}

export function isBoath(req: Request, res: Response, next: NextFunction) {
  if (req.user?.type !== "event_creator" && req.user?.type !== "admin") {
    return res.status(403).json({ message: "nije ni admin ni kreator" });
  }
  next();
}