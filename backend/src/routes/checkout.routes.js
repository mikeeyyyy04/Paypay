import { Router } from 'express';
import { checkoutManual, paymongoDisabled } from '../controllers/checkout.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const checkoutRoutes = Router();

checkoutRoutes.post('/manual', asyncHandler(checkoutManual));
checkoutRoutes.post('/bank-transfer', asyncHandler(checkoutManual));
checkoutRoutes.post('/paymongo', asyncHandler(paymongoDisabled));
