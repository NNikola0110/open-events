import express from 'express';
import { authenticateToken } from '../middleware/authenticate';
import { isAdmin, isBoath, isEventCreator } from '../middleware/autorization';
import {getEvents } from '../controller/eventController';

const routs =express.Router();

//routs.post('/createEvent',authenticateToken,isAdmin || isEventCreator,addEvent);
routs.get('/events',authenticateToken, isAdmin || isEventCreator,getEvents);
routs.delete('/events/:id',authenticateToken, isEventCreator);
routs.put('/events/:id',authenticateToken, isEventCreator);

export default routs;