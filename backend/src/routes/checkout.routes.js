import { Router } from 'express';

import {
  manualCheckout,
  paypalCheckout,
  paypalCapture,
} from '../controllers/checkout.controller.js';

import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/**
 * Manual checkout (GCash or Bank Transfer)
 */
router.post(
  '/manual',
  asyncHandler(manualCheckout)
);

/**
 * GCash Checkout alias for legacy clients
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