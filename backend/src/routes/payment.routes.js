import { Router } from 'express';
import {
  createBankAccount,
  listAdminBankAccounts,
  listPaymentMethods,
  listPublicBankAccounts,
  updateBankAccount,
} from '../controllers/payment.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicPaymentRoutes = Router();
export const adminPaymentRoutes = Router();

publicPaymentRoutes.get('/payment-methods', asyncHandler(listPaymentMethods));
publicPaymentRoutes.get('/bank-accounts', asyncHandler(listPublicBankAccounts));
adminPaymentRoutes.get('/bank-accounts', asyncHandler(requireAdmin), asyncHandler(listAdminBankAccounts));
adminPaymentRoutes.post('/bank-accounts', asyncHandler(requireAdmin), asyncHandler(createBankAccount));
adminPaymentRoutes.put('/bank-accounts/:bankAccountId', asyncHandler(requireAdmin), asyncHandler(updateBankAccount));
