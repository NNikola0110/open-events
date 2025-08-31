import express from 'express';
import { authenticateToken } from '../middleware/authenticate';
import { isBoath } from '../middleware/autorization';

const routs =express.Router();

routs.post('/createEvent',authenticateToken, isBoath);
routs.get('/events',authenticateToken, isBoath);
routs.delete('/events/:id',authenticateToken, isBoath);
routs.put('/events/:id',authenticateToken, isBoath);

export default routs;