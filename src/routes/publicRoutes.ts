import { Router } from "express";
import {
  getPublicEventDetails,
  getPublicComments,
  addPublicComment,
  reactToEvent,
  reactToComment,
  getTop,
} from "../controller/publicController";

const router = Router();

// Detalji događaja + brojanje pregleda (samo prvi put po posetiocu)
router.get("/events/:id", getPublicEventDetails);

// Komentari (paginirano) + dodavanje
router.get("/events/:id/comments", getPublicComments);
router.post("/events/:id/comments", addPublicComment);

// Reakcije (like/dislike) – jednom po posetiocu
router.post("/events/:id/reactions", reactToEvent);
router.post("/comments/:id/reactions", reactToComment);
router.get("/comments/top", getTop);

export default router;
