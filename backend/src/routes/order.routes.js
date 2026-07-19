import { Router } from 'express';
import {
  getPublicOrder,
  listAdminOrders,
  submitPaymentProof,
  updateAdminOrder,
} from '../controllers/order.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicOrderRoutes = Router();
export const adminOrderRoutes = Router();

publicOrderRoutes.get('/:orderId', asyncHandler(getPublicOrder));
publicOrderRoutes.post('/:orderId/payment-proof', asyncHandler(submitPaymentProof));
adminOrderRoutes.get('/', asyncHandler(requireAdmin), asyncHandler(listAdminOrders));
adminOrderRoutes.patch('/:orderId', asyncHandler(requireAdmin), asyncHandler(updateAdminOrder));
