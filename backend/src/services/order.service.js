import { prisma } from '../database/prisma.js';
import { approveEnrollmentForOrder } from './class.service.js';
import { publicUser } from './auth.service.js';
import { parseOrderStatusPayload, parsePaymentProofPayload } from '../schemas/order.schema.js';

const PAYMENT_STATUS_TO_API = {
  PENDING: 'Pending',
  REVIEWING: 'Reviewing',
  PAID: 'Paid',
  REJECTED: 'Rejected',
  FAILED: 'Rejected',
  REFUNDED: 'Rejected',
};

const API_STATUS_TO_PAYMENT = {
  Pending: 'PENDING',
  Reviewing: 'REVIEWING',
  Paid: 'PAID',
  Rejected: 'REJECTED',
};

function centsToAmount(cents) {
  return Number((Number(cents ?? 0) / 100).toFixed(2));
}

function parsePaymentNotes(notes) {
  if (!notes) {
    return {};
  }

  try {
    return JSON.parse(notes);
  } catch {
    return { notes };
  }
}

function paymentForOrder(order) {
  return order.payments?.[0] ?? null;
}

function orderStatus(order) {
  const payment = paymentForOrder(order);
  return PAYMENT_STATUS_TO_API[payment?.status] ?? (order.status === 'PAID' ? 'Paid' : 'Pending');
}

function orderItems(order) {
  return (order.items ?? []).map((item) => ({
    classId: item.classId,
    title: item.titleSnapshot,
    price: centsToAmount(item.unitPriceCents),
  }));
}

function classTitle(order) {
  return orderItems(order).map((item) => item.title).join(', ');
}

export async function nextOrderId() {
  const orders = await prisma.order.findMany({ select: { orderNumber: true } });
  const highestOrderNumber = orders.reduce((highest, order) => {
    const match = String(order.orderNumber ?? '').match(/^PP-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 1000);

  return `PP-${highestOrderNumber + 1}`;
}

export function sanitizeOrder(order) {
  const payment = paymentForOrder(order);
  const paymentNotes = parsePaymentNotes(payment?.notes);

  return {
    id: order.orderNumber,
    customer: order.studentName,
    email: order.studentEmail,
    classTitle: classTitle(order),
    amount: centsToAmount(order.totalCents),
    paymentMethod: payment?.method?.name ?? '',
    status: orderStatus(order),
    reference: order.orderNumber,
    transferDate: payment?.submittedAt?.toISOString().slice(0, 10) ?? order.createdAt.toISOString().slice(0, 10),
    bankName: paymentNotes.bankName ?? '',
    notes: paymentNotes.message ?? payment?.notes ?? '',
    verifiedBy: payment?.verifier ? publicUser({ ...payment.verifier, role: 'admin' }).name : undefined,
    verifiedAt: payment?.verifiedAt?.toISOString(),
    enrollmentApproved: order.status === 'PAID',
    paymentReferenceNumber: payment?.externalReference,
    receipt: paymentNotes.receipt,
  };
}

export async function findOrder(orderNumber) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: {
        include: { method: true, verifier: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function listOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      payments: {
        include: { method: true, verifier: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => sanitizeOrder(order));
}

export function publicOrderDetail(order) {
  const payment = paymentForOrder(order);
  const paymentNotes = parsePaymentNotes(payment?.notes);

  return {
    id: order.orderNumber,
    customer: order.studentName,
    email: order.studentEmail,
    status: orderStatus(order),
    amount: centsToAmount(order.totalCents),
    reference: order.orderNumber,
    items: orderItems(order),
    payment: {
      gateway: paymentNotes.gateway ?? payment?.method?.name ?? '',
      sessionId: payment?.id ?? '',
      paymentUrl: paymentNotes.paymentUrl ?? '',
      amount: centsToAmount(payment?.amountCents),
      currency: payment?.currency ?? order.currency,
      payerEmail: order.studentEmail,
      expiresAt: paymentNotes.expiresAt ?? null,
      orderId: order.orderNumber,
      instructions: paymentNotes.message ?? payment?.method?.instructions ?? '',
      method: payment?.method
        ? {
            code: payment.method.code,
            name: payment.method.name,
            accountName: paymentNotes.accountName ?? '',
            accountNumber: paymentNotes.accountNumber ?? '',
            qrImageUrl: paymentNotes.qrImageUrl ?? '',
            instructions: payment.method.instructions ?? '',
          }
        : undefined,
    },
    paymentReferenceNumber: payment?.externalReference,
    receipt: paymentNotes.receipt,
  };
}

export async function submitOrderPaymentProof(order, body) {
  const validation = parsePaymentProofPayload(body);

  if (validation.error) {
    return { error: validation.error };
  }

  const payment = paymentForOrder(order);

  if (!payment) {
    return { error: 'Payment record not found.' };
  }

  const { referenceNumber, receiptFile } = validation.values;
  const existingNotes = parsePaymentNotes(payment.notes);
  const notes = {
    ...existingNotes,
    message: `Receipt submitted with reference ${referenceNumber}.`,
    receipt: {
      name: receiptFile.name,
      type: receiptFile.type,
      size: receiptFile.size,
      dataUrl: receiptFile.dataUrl,
      submittedAt: new Date().toISOString(),
    },
  };

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'REVIEWING',
      externalReference: referenceNumber,
      submittedAt: new Date(),
      notes: JSON.stringify(notes),
    },
    include: { method: true, verifier: true },
  });

  return { order: sanitizeOrder({ ...order, payments: [updatedPayment] }) };
}

export async function updateOrderStatus(order, body, user) {
  const validation = parseOrderStatusPayload(body, { status: orderStatus(order), notes: sanitizeOrder(order).notes });

  if (validation.error) {
    return { error: validation.error };
  }

  const payment = paymentForOrder(order);

  if (!payment) {
    return { error: 'Payment record not found.' };
  }

  const { status, notes } = validation.values;
  const paymentStatus = API_STATUS_TO_PAYMENT[status];
  const existingNotes = parsePaymentNotes(payment.notes);
  const verified = status === 'Paid' || status === 'Rejected';

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        verifiedByUserId: verified ? user.id : null,
        verifiedAt: verified ? new Date() : null,
        notes: JSON.stringify({ ...existingNotes, message: notes }),
      },
      include: { method: true, verifier: true },
    });

    const nextOrderStatus = status === 'Paid' ? 'PAID' : order.status === 'PAID' ? 'PENDING_PAYMENT' : order.status;
    const baseOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: nextOrderStatus,
        paidAt: status === 'Paid' ? new Date() : null,
      },
      include: { items: true },
    });

    return { ...baseOrder, payments: [updatedPayment] };
  });

  if (status === 'Paid') {
    await approveEnrollmentForOrder(updatedOrder);
  }

  return { order: sanitizeOrder(updatedOrder) };
}
