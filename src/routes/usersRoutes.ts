import express from 'express';
import {register, login} from '../controller/userController';

const routs =express.Router();

routs.post('/register',register);
routs.post('/login',login);


export default routs;