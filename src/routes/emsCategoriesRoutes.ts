import express from 'express';
import { addCategory, getCategories, deleteCategory,updateCategoryHandler } from '../controller/emsCategoriesController';
import { isAdmin, isEventCreator } from '../middleware/autorization';
import ca from 'zod/v4/locales/ca.js';
import { get } from 'http';

import { authenticateToken } from '../middleware/authenticate';


const routs =express.Router();

routs.post('/categories',authenticateToken, isAdmin || isEventCreator, addCategory);
routs.get('/categories',authenticateToken, isAdmin|| isEventCreator, getCategories);
routs.delete('/categories/:id',authenticateToken, isAdmin || isEventCreator, deleteCategory);
routs.put('/categories/:id',authenticateToken, isAdmin || isEventCreator, updateCategoryHandler);

export default routs;