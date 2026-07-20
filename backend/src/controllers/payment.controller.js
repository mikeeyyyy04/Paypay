import {
  listPaymentMethods as listConfiguredPaymentMethods,
} from '../services/payment.service.js';

export async function listPaymentMethods(request, response) {
  const paymentMethods = await listConfiguredPaymentMethods();
  response.status(200).json({ paymentMethods });
}
