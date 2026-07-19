import crypto from 'node:crypto';
import { prisma } from '../database/prisma.js';

const PAYMONGO_API_BASE_URL = 'https://api.paymongo.com';
const DEFAULT_PAYMENT_METHOD_TYPES = ['card', 'gcash', 'qrph'];

const defaultManualPaymentMethods = [
  {
    code: 'gcash',
    name: 'GCash',
    instructions: 'Send the exact total to the GCash number, then keep your receipt for admin verification.',
  },
  {
    code: 'bank_transfer',
    name: 'Bank transfer',
    instructions: 'Transfer the exact total to the school bank account, then keep your receipt for admin verification.',
  },
];

export function configuredBankAccounts() {
  return [
    {
      id: process.env.SCHOOL_BANK_ACCOUNT_ID ?? 'default-bank-account',
      bankName: process.env.SCHOOL_BANK_NAME ?? 'Add bank name in backend/.env',
      accountName: process.env.SCHOOL_BANK_ACCOUNT_NAME ?? 'School Admin',
      accountNumber: process.env.SCHOOL_BANK_ACCOUNT_NUMBER ?? 'Add bank account number in backend/.env',
      routingNumber: process.env.SCHOOL_BANK_ROUTING_NUMBER ?? '',
      instructions: 'Use your order reference when sending payment, then upload your receipt.',
      isActive: true,
    },
  ];
}

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
    where: { code: { in: ['gcash', 'bank_transfer'] }, isActive: true },
    orderBy: { code: 'asc' },
  });

  return methods.map((method) => ({
    code: method.code,
    name: method.name,
    ...(method.code === 'gcash' ? gcashDetails() : configuredBankAccounts()[0]),
    instructions: method.instructions ?? '',
  }));
}

export async function findPaymentMethod(code) {
  await ensurePaymentMethods();
  return prisma.paymentMethod.findUnique({ where: { code } });
}

export function sanitizeBankAccount(account) {
  return {
    id: account.id,
    bankName: account.bankName,
    accountName: account.accountName,
    accountNumber: account.accountNumber,
    routingNumber: account.routingNumber ?? '',
    instructions: account.instructions ?? '',
    isActive: Boolean(account.isActive),
  };
}

export function createBankTransferSession({ orderId, email, totalAmount, bankAccount }) {
  return {
    gateway: 'Manual payment',
    sessionId: orderId,
    paymentUrl: '',
    amount: totalAmount,
    currency: 'PHP',
    expiresAt: null,
    payerEmail: email,
    orderId,
    method: {
      code: 'bank_transfer',
      name: 'Bank transfer',
      bankAccountId: bankAccount.id,
      bankName: bankAccount.bankName,
      accountName: bankAccount.accountName,
      accountNumber: bankAccount.accountNumber,
      routingNumber: bankAccount.routingNumber ?? '',
      instructions: bankAccount.instructions ?? '',
    },
    instructions: bankAccount.instructions ?? 'Use your order reference when sending payment, then upload your receipt.',
  };
}

export function createManualPaymentSession({ orderId, email, totalAmount, paymentMethod }) {
  return {
    gateway: 'Manual payment',
    sessionId: orderId,
    paymentUrl: '',
    amount: totalAmount,
    currency: 'PHP',
    expiresAt: null,
    payerEmail: email,
    orderId,
    method: paymentMethod,
    instructions: paymentMethod.instructions,
  };
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to create a PayMongo checkout session.`);
  }

  return value;
}

function parsePaymentMethodTypes() {
  return (process.env.PAYMONGO_PAYMENT_METHOD_TYPES ?? DEFAULT_PAYMENT_METHOD_TYPES.join(','))
    .split(',')
    .map((methodType) => methodType.trim())
    .filter(Boolean);
}

function toPayMongoAmount(amount) {
  return Math.round(Number(amount) * 100);
}

function authHeader(secretKey) {
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

function getCheckoutUrlFromResponse(payload) {
  return payload?.data?.attributes?.checkout_url;
}

export async function createPayMongoCheckoutSession({
  orderId,
  customerName,
  email,
  selectedClasses,
  subtotal,
  serviceFee,
  totalAmount,
  origin,
}) {
  const secretKey = getRequiredEnv('PAYMONGO_SECRET_KEY');
  const appBaseUrl = (process.env.APP_BASE_URL ?? origin ?? 'http://127.0.0.1:5173').replace(/\/$/, '');

  const lineItems = selectedClasses.map((classItem) => ({
    name: classItem.title,
    amount: classItem.priceCents,
    currency: 'PHP',
    quantity: 1,
    description: classItem.description,
  }));

  if (serviceFee > 0) {
    lineItems.push({
      name: 'Gateway fee',
      amount: toPayMongoAmount(serviceFee),
      currency: 'PHP',
      quantity: 1,
      description: 'Payment processing fee',
    });
  }

  const response = await fetch(`${PAYMONGO_API_BASE_URL}/v2/checkout_sessions`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(secretKey),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: { name: customerName, email },
          description: `Paypay enrollment ${orderId}`,
          line_items: lineItems,
          payment_method_types: parsePaymentMethodTypes(),
          reference_number: orderId,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          success_url: `${appBaseUrl}/checkout/${encodeURIComponent(orderId)}`,
          cancel_url: `${appBaseUrl}/checkout`,
          metadata: { orderId },
        },
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.detail ??
      payload?.errors?.[0]?.title ??
      payload?.message ??
      `PayMongo checkout failed with status ${response.status}.`;
    throw new Error(message);
  }

  const checkoutUrl = getCheckoutUrlFromResponse(payload);

  if (!checkoutUrl) {
    throw new Error('PayMongo did not return a checkout URL.');
  }

  const sessionId = payload.data.id;
  const expiresAt = payload.data.attributes?.expires_at;

  return {
    gateway: 'PayMongo',
    sessionId,
    checkoutSessionId: sessionId,
    paymentUrl: checkoutUrl,
    checkoutUrl,
    amount: totalAmount,
    subtotal,
    serviceFee,
    currency: 'PHP',
    expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
    payerEmail: email,
    orderId,
  };
}

function parseSignatureHeader(signatureHeader) {
  return String(signatureHeader ?? '')
    .split(',')
    .reduce((values, part) => {
      const [key, ...rest] = part.split('=');
      values[key?.trim()] = rest.join('=').trim();
      return values;
    }, {});
}

export function verifyPayMongoWebhookSignature({ rawBody, signatureHeader, livemode }) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return true;
  }

  const signatureValues = parseSignatureHeader(signatureHeader);
  const timestamp = signatureValues.t;
  const signature = livemode ? signatureValues.li : signatureValues.te;

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
