import crypto from 'node:crypto';

const BANK_OPTIONS = ['BPI', 'BDO', 'UnionBank', 'Metrobank'];

function pickBank() {
  return BANK_OPTIONS[Math.floor(Math.random() * BANK_OPTIONS.length)];
}

function createVirtualAccountNumber() {
  return `9${Math.floor(10 ** 11 + Math.random() * 9 * 10 ** 11)}`;
}

export function createBankTransferSession({ orderId, amount, email }) {
  const bankName = pickBank();
  const sessionId = crypto.randomBytes(8).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    gateway: 'PaypayGatewaySandbox',
    sessionId,
    paymentUrl: `https://sandbox.paypay-gateway.local/pay/${sessionId}`,
    bankName,
    virtualAccountNumber: createVirtualAccountNumber(),
    amount,
    currency: 'PHP',
    expiresAt,
    payerEmail: email,
    orderId,
  };
}
