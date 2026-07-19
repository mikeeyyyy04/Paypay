import {
  findOrder,
  listOrders,
  publicOrderDetail,
  submitOrderPaymentProof,
  updateOrderStatus,
} from '../services/order.service.js';

export async function listAdminOrders(request, response) {
  response.status(200).json({ orders: await listOrders() });
}

export async function submitPaymentProof(request, response) {
  const order = await findOrder(request.params.orderId);

  if (!order) {
    response.status(404).json({ message: 'Order not found.' });
    return;
  }

  const result = await submitOrderPaymentProof(order, request.body);

  if (result.error) {
    response.status(400).json({ message: result.error });
    return;
  }

  response.status(200).json({ order: result.order });
}

export async function updateAdminOrder(request, response) {
  const order = await findOrder(request.params.orderId);

  if (!order) {
    response.status(404).json({ message: 'Order not found.' });
    return;
  }

  const result = await updateOrderStatus(order, request.body, request.user);

  if (result.error) {
    response.status(400).json({ message: result.error });
    return;
  }

  response.status(200).json({ order: result.order });
}

export async function getPublicOrder(request, response) {
  const order = await findOrder(request.params.orderId);

  if (!order) {
    response.status(404).json({ message: 'Order not found.' });
    return;
  }

  response.status(200).json(publicOrderDetail(order));
}
