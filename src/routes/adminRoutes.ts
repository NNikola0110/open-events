import express from 'express';
import { listOfUsers, registerUser, updateUser } from '../controller/adminController';
import { authenticateToken } from '../middleware/authenticate';
import { isAdmin } from '../middleware/autorization';

const routs =express.Router();

routs.get('/users',authenticateToken, isAdmin, listOfUsers);
routs.post('/users',authenticateToken, isAdmin, registerUser);
routs.put('/users/:id',authenticateToken, isAdmin, updateUser);
//routs.patch('/users/:id/status',authenticateToken, isAdmin, registerUser);

export default routs;