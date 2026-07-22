import express from 'express';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../midlleware/authMiddleware.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllUsers));
userRouter.post('/reset-password', catchError(userController.resetMail));
userRouter.post('/reset-email/:resetToken', catchError(userController.reset));
