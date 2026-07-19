import { prisma } from '../database/prisma.js';
import { findClassesForCheckout, classPrice } from './class.service.js';
import {
  configuredBankAccounts,
  createBankTransferSession,
  createManualPaymentSession,
  findPaymentMethod,
  gcashDetails,
} from './payment.service.js';
import { nextOrderId } from './order.service.js';
import { parseManualCheckoutPayload } from '../schemas/checkout.schema.js';

function buildOrderSummary(selectedClasses) {
  return selectedClasses.map((classItem) => classItem.title).join(', ');
}

function buildOrderItems(selectedClasses) {
  return selectedClasses.map((classItem) => ({
    classId: String(classItem.id),
    title: classItem.title,
    price: Number(classPrice(classItem).toFixed(2)),
  }));
}

function amountToCents(amount) {
  return Math.round(Number(amount) * 100);
}

export async function createManualCheckout(body) {
  const validation = parseManualCheckoutPayload(body);

  if (validation.error) {
    return { statusCode: 400, body: { message: validation.error } };
  }

  const { customerName, email, paymentMethod: paymentMethodCode, bankAccountId, items } = validation.values;
  const selectedClassIds = items.map((item) => item.classId);
  const selectedClasses = await findClassesForCheckout(selectedClassIds);

  if (selectedClasses.length === 0) {
    return { statusCode: 400, body: { message: 'No valid active classes found for checkout.' } };
  }

  const paymentMethod = await findPaymentMethod(paymentMethodCode);

  if (!paymentMethod?.isActive) {
    return { statusCode: 400, body: { message: 'Payment method is not configured.' } };
  }

  const subtotal = selectedClasses.reduce((total, classItem) => total + classPrice(classItem), 0);
  const totalAmount = Number(subtotal.toFixed(2));
  const orderNumber = await nextOrderId();
  let paymentSession;
  let bankName = '';

  if (paymentMethodCode === 'gcash') {
    const paymentMethodDetails = {
      code: 'gcash',
      name: 'GCash',
      ...gcashDetails(),
      instructions: paymentMethod.instructions ?? '',
    };

    bankName = 'GCash';
    paymentSession = createManualPaymentSession({
      orderId: orderNumber,
      email,
      totalAmount,
      paymentMethod: paymentMethodDetails,
    });
  } else {
    const bankAccounts = configuredBankAccounts().filter((account) => account.isActive);
    const bankAccount = bankAccounts.find((account) => account.id === bankAccountId) ?? bankAccounts[0];

    if (!bankAccount) {
      return { statusCode: 400, body: { message: 'No active bank account is available for payment.' } };
    }

    bankName = bankAccount.bankName;
    paymentSession = createBankTransferSession({ orderId: orderNumber, email, totalAmount, bankAccount });
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      studentName: customerName,
      studentEmail: email,
      status: 'PENDING_PAYMENT',
      subtotalCents: amountToCents(subtotal),
      totalCents: amountToCents(totalAmount),
      currency: 'PHP',
      items: {
        create: selectedClasses.map((classItem) => ({
          classId: classItem.id,
          titleSnapshot: classItem.title,
          unitPriceCents: classItem.priceCents,
          quantity: 1,
          lineTotalCents: classItem.priceCents,
        })),
      },
      payments: {
        create: {
          paymentMethodId: paymentMethod.id,
          amountCents: amountToCents(totalAmount),
          currency: 'PHP',
          status: 'PENDING',
          notes: JSON.stringify({
            bankName,
            gateway: paymentSession,
            message:
              paymentMethodCode === 'gcash' ? 'Awaiting payment verification.' : 'Awaiting student receipt upload.',
          }),
        },
      },
    },
  });

  return {
    statusCode: 201,
    body: {
      orderId: order.orderNumber,
      amount: totalAmount,
      currency: paymentSession.currency,
      checkoutUrl: `/checkout/${encodeURIComponent(order.orderNumber)}`,
      payment: paymentSession,
      classTitle: buildOrderSummary(selectedClasses),
      items: buildOrderItems(selectedClasses),
    },
  };
}
