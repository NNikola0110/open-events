// src/routes/publicRoutes.ts
import { Router } from "express";
import {
  publicAddRSVP, publicRemoveRSVP, publicRSVPCount, publicRSVPStatus
} from "../controller/rsvpController";


const router = Router();

router.post   ("/events/:id/rsvp",        publicAddRSVP);
router.delete ("/events/:id/rsvp",        publicRemoveRSVP);
router.get    ("/events/:id/rsvps/count", publicRSVPCount);
router.get    ("/events/:id/rsvp/status", publicRSVPStatus);

export default router;
