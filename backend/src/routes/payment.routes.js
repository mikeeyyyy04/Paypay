import { Router } from 'express';
import { listPaymentMethods } from '../controllers/payment.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

console.log('✅ NEW payment.routes.js loaded');

export const publicPaymentRoutes = Router();
export const adminPaymentRoutes = Router();

publicPaymentRoutes.get(
  '/payment-methods',
  asyncHandler(listPaymentMethods)
);