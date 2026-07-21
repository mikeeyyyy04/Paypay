import { prisma } from '../database/prisma.js';

const defaultPaymentMethods = [
  {
    code: 'gcash',
    name: 'GCash',
    instructions:
      'Send the payment to the GCash account below, then upload your receipt for verification.',
  },
  {
    code: 'bank_transfer',
    name: 'Bank transfer',
    instructions:
      'Transfer the payment to the bank account below, then upload your receipt for verification.',
  },
  {
    code: 'paypal',
    name: 'PayPal',
    instructions:
      'Pay securely using your PayPal account or a debit/credit card.',
  },
];

/**
 * GCash account details
 */
export function gcashDetails() {
  return {
    accountName:
      process.env.SCHOOL_GCASH_NAME ?? 'School Administrator',
    accountNumber:
      process.env.SCHOOL_GCASH_NUMBER ?? '',
    qrImageUrl:
      process.env.SCHOOL_GCASH_QR_URL ?? '/gcash-qr.png',
  };
}

/**
 * Seed payment methods
 */
export async function ensurePaymentMethods() {
  await prisma.paymentMethod.createMany({
    data: defaultPaymentMethods,
    skipDuplicates: true,
  });
}

/**
 * List available payment methods
 */
export async function listPaymentMethods() {
  await ensurePaymentMethods();

  const methods = await prisma.paymentMethod.findMany({
    where: {
      isActive: true,
      code: {
        in: ['gcash', 'paypal', 'bank_transfer'],
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return methods.map((method) => ({
    code: method.code,
    name: method.name,
    instructions: method.instructions ?? '',
    ...(method.code === 'gcash'
      ? {
          accountName: gcashDetails().accountName,
          accountNumber: gcashDetails().accountNumber,
          qrImageUrl: gcashDetails().qrImageUrl,
        }
      : {}),
  }));
}

/**
 * Find one payment method
 */
export async function findPaymentMethod(code) {
  await ensurePaymentMethods();

  return prisma.paymentMethod.findUnique({
    where: {
      code,
    },
  });
}

/**
 * Create GCash payment session
 */
export function createManualPaymentSession({
  orderId,
  email,
  totalAmount,
  paymentMethod,
}) {
  return {
    gateway: 'GCash',
    sessionId: orderId,
    paymentUrl: '',
    amount: totalAmount,
    currency: 'USD',
    payerEmail: email,
    expiresAt: null,
    orderId,
    method: paymentMethod,
    instructions: paymentMethod.instructions,
  };
}