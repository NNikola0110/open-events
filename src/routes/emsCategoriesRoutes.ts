import express from 'express';
import { addCategory, getCategories, deleteCategory,updateCategoryHandler } from '../controller/emsCategoriesController';
import { isAdmin, isAdminOrEventCreator, isEventCreator } from '../middleware/autorization';
import ca from 'zod/v4/locales/ca.js';
import { get } from 'http';

import { authenticateToken } from '../middleware/authenticate';


const routs =express.Router();

routs.post('/categories',authenticateToken,isAdminOrEventCreator, addCategory);
routs.get('/categories',authenticateToken, isAdminOrEventCreator, getCategories);
routs.delete('/categories/:id',authenticateToken, isAdminOrEventCreator, deleteCategory);
routs.put('/categories/:id',authenticateToken, isAdminOrEventCreator, updateCategoryHandler);

export default routs;