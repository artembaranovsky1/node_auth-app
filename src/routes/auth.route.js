import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../midlleware/authMiddleware.js';
import { guestMiddleware } from '../midlleware/guestMiddleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
