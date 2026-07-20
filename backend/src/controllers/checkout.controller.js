import {
  createManualCheckout,
  createPaypalCheckout,
  capturePaypalCheckout,
} from '../services/checkout.service.js';

/**
 * GCash Checkout
 */
export async function manualCheckout(request, response) {
  const result = await createManualCheckout(request.body);

  return response
    .status(result.statusCode)
    .json(result.body);
}

/**
 * Create PayPal Order
 */
export async function paypalCheckout(request, response) {
  const result = await createPaypalCheckout(request.body);

  return response
    .status(result.statusCode)
    .json(result.body);
}

/**
 * Capture PayPal Payment
 */
export async function paypalCapture(request, response) {
  const result = await capturePaypalCheckout(request.body);

  return response
    .status(result.statusCode)
    .json(result.body);
}