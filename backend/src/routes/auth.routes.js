import { Router } from 'express';
import { getCurrentUser, login, logout } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRoutes = Router();

authRoutes.post('/login', asyncHandler(login));
authRoutes.get('/me', asyncHandler(getCurrentUser));
authRoutes.post('/logout', asyncHandler(logout));
