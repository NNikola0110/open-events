import express from 'express';
import { authenticateToken } from '../middleware/authenticate';
import { isAdmin, isEventCreator, isAdminOrEventCreator } from '../middleware/autorization';
import {getEvents,addEvent,updateEvent,deleteEvent,getEventbyID } from '../controller/eventController';
import de from 'zod/v4/locales/de.js';

const routs =express.Router();

routs.post('/createEvent',authenticateToken,isAdmin || isEventCreator,addEvent);
routs.get('/events',authenticateToken, isAdmin || isEventCreator,getEvents);
routs.delete('/events/:id',authenticateToken, isAdminOrEventCreator,deleteEvent);
routs.put('/events/:id',authenticateToken,  isAdmin ,updateEvent);
routs.get('/events/:id',authenticateToken, isAdminOrEventCreator,getEventbyID);

export default routs;