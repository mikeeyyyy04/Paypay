import { Router } from 'express';

import {
  manualCheckout,
  paypalCheckout,
  paypalCapture,
} from '../controllers/checkout.controller.js';

import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/**
 * GCash Checkout
 */
router.post(
  '/gcash',
  asyncHandler(manualCheckout)
);

/**
 * Create PayPal Order
 */
router.post(
  '/paypal/create-order',
  asyncHandler(paypalCheckout)
);

/**
 * Capture PayPal Payment
 */
router.post(
  '/paypal/capture-order',
  asyncHandler(paypalCapture)
);

export default router;