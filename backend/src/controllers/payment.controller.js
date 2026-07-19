import {
  configuredBankAccounts,
  listPaymentMethods as listConfiguredPaymentMethods,
  sanitizeBankAccount,
} from '../services/payment.service.js';

export async function listPaymentMethods(request, response) {
  const paymentMethods = await listConfiguredPaymentMethods();
  response.status(200).json({ paymentMethods });
}

export async function listPublicBankAccounts(request, response) {
  const bankAccounts = configuredBankAccounts().filter((account) => account.isActive);
  response.status(200).json({ bankAccounts: bankAccounts.map((account) => sanitizeBankAccount(account)) });
}

export async function listAdminBankAccounts(request, response) {
  const bankAccounts = configuredBankAccounts();
  response.status(200).json({ bankAccounts: bankAccounts.map((account) => sanitizeBankAccount(account)) });
}

export async function createBankAccount(request, response) {
  response.status(501).json({ message: 'Bank account persistence requires a Prisma BankAccount model.' });
}

export async function updateBankAccount(request, response) {
  response.status(501).json({ message: 'Bank account persistence requires a Prisma BankAccount model.' });
}
