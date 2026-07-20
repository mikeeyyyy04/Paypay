import { prisma } from '../database/prisma.js';




const defaultManualPaymentMethods = [
  {
    code: 'gcash',
    name: 'GCash',
    instructions:
      'Send the exact total to the GCash number, then upload your receipt for verification.',
  },
  {
    code: 'paypal',
    name: 'PayPal',
    instructions:
      'Complete your payment securely using PayPal.',
  },
];


export function gcashDetails() {
  return {
    accountName: process.env.SCHOOL_GCASH_NAME ?? 'School Admin',
    accountNumber: process.env.SCHOOL_GCASH_NUMBER ?? 'Add GCash number in backend/.env',
    qrImageUrl: process.env.SCHOOL_GCASH_QR_URL ?? '/gcash-qr.png',
  };
}

export async function ensurePaymentMethods() {
  await prisma.paymentMethod.createMany({
    data: defaultManualPaymentMethods,
    skipDuplicates: true,
  });
}

export async function listPaymentMethods() {
  await ensurePaymentMethods();
  const methods = await prisma.paymentMethod.findMany({
  where: {
    code: { in: ['gcash', 'paypal'] },
    isActive: true,
  },
  orderBy: {
    code: 'asc',
  },
});

return methods.map((method) => ({
  code: method.code,
  name: method.name,
  ...(method.code === 'gcash' ? gcashDetails() : {}),
  instructions: method.instructions ?? '',
}));
}

export async function findPaymentMethod(code) {
  await ensurePaymentMethods();
  return prisma.paymentMethod.findUnique({ where: { code } });
}


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
    expiresAt: null,
    payerEmail: email,
    orderId,
    method: paymentMethod,
    instructions: paymentMethod.instructions,
  };
}
