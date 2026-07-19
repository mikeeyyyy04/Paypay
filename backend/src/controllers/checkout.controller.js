import { createManualCheckout } from '../services/checkout.service.js';

export async function checkoutManual(request, response) {
  const result = await createManualCheckout(request.body);
  response.status(result.statusCode).json(result.body);
}

export async function paymongoDisabled(request, response) {
  response.status(410).json({ message: 'PayMongo checkout is disabled. Please use manual payment.' });
}
