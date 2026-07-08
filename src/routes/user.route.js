import express from 'express';
import { userService } from '../services/user.service.js';
import { authMiddleware } from '../midlleware/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userService.getAllUsers));
