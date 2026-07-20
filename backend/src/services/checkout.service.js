import { prisma } from '../database/prisma.js';

import {
  findClassesForCheckout,
  classPrice,
} from './class.service.js';

import {
  nextOrderId,
} from './order.service.js';

import {
  parseManualCheckoutPayload,
} from '../schemas/checkout.schema.js';

import {
  findPaymentMethod,
  gcashDetails,
  createManualPaymentSession,
} from './payment.service.js';

import {
  createPaypalOrder,
  capturePaypalOrder,
} from './paypal.service.js';

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */

function buildOrderSummary(selectedClasses) {
  return selectedClasses
    .map((item) => item.title)
    .join(', ');
}

function buildOrderItems(selectedClasses) {
  return selectedClasses.map((item) => ({
    classId: String(item.id),
    title: item.title,
    price: Number(classPrice(item).toFixed(2)),
  }));
}

function amountToCents(amount) {
  return Math.round(Number(amount) * 100);
}

/* ----------------------------------------------------------
   Create Order
---------------------------------------------------------- */

async function createOrder({
  orderNumber,
  customerName,
  email,
  subtotal,
  totalAmount,
  selectedClasses,
}) {
  return prisma.order.create({
    data: {
      orderNumber,

      studentName: customerName,

      studentEmail: email,

      status: 'PENDING_PAYMENT',

      subtotalCents: amountToCents(subtotal),

      totalCents: amountToCents(totalAmount),

      currency: 'USD',

      items: {
        create: selectedClasses.map((classItem) => ({
          classId: classItem.id,

          titleSnapshot: classItem.title,

          unitPriceCents: classItem.priceCents,

          quantity: 1,

          lineTotalCents: classItem.priceCents,
        })),
      },
    },
  });
}

/* ----------------------------------------------------------
   Create Payment
---------------------------------------------------------- */

async function createPayment({
  orderId,
  paymentMethod,
  totalAmount,
  gateway,
}) {
  return prisma.payment.create({
    data: {
      orderId,

      paymentMethodId: paymentMethod.id,

      amountCents: amountToCents(totalAmount),

      currency: 'USD',

      status: 'PENDING',

      notes: JSON.stringify({
        gateway,
      }),
    },
  });
}

/* ----------------------------------------------------------
   GCash Checkout
---------------------------------------------------------- */

export async function createManualCheckout(body) {
  const validation = parseManualCheckoutPayload(body);

  if (validation.error) {
    return {
      statusCode: 400,
      body: {
        message: validation.error,
      },
    };
  }

  const {
    customerName,
    email,
    paymentMethod: paymentMethodCode,
    items,
  } = validation.values;

  if (paymentMethodCode !== 'gcash') {
    return {
      statusCode: 400,
      body: {
        message: 'Invalid payment method.',
      },
    };
  }

  const selectedClassIds = items.map((item) => item.classId);

  const selectedClasses =
    await findClassesForCheckout(selectedClassIds);

  if (!selectedClasses.length) {
    return {
      statusCode: 400,
      body: {
        message: 'No valid classes selected.',
      },
    };
  }

  const paymentMethod =
    await findPaymentMethod('gcash');

  if (!paymentMethod?.isActive) {
    return {
      statusCode: 400,
      body: {
        message: 'GCash payment is unavailable.',
      },
    };
  }

  const subtotal = selectedClasses.reduce(
    (total, classItem) => total + classPrice(classItem),
    0
  );

  const totalAmount = Number(subtotal.toFixed(2));

  const orderNumber = await nextOrderId();

  const paymentSession =
    createManualPaymentSession({
      orderId: orderNumber,
      email,
      totalAmount,
      paymentMethod: {
        code: 'gcash',
        name: 'GCash',
        ...gcashDetails(),
        instructions:
          paymentMethod.instructions ?? '',
      },
    });

  const order = await createOrder({
    orderNumber,
    customerName,
    email,
    subtotal,
    totalAmount,
    selectedClasses,
  });

  await createPayment({
    orderId: order.id,
    paymentMethod,
    totalAmount,
    gateway: paymentSession,
  });

  return {
    statusCode: 201,
    body: {
      success: true,

      paymentMethod: 'gcash',

      orderId: order.orderNumber,

      amount: totalAmount,

      currency: 'USD',

      payment: paymentSession,

      classTitle:
        buildOrderSummary(selectedClasses),

      items:
        buildOrderItems(selectedClasses),
    },
  };
}

/* ----------------------------------------------------------
   PayPal Checkout
---------------------------------------------------------- */

export async function createPaypalCheckout(body) {
  const validation = parseManualCheckoutPayload(body);

  if (validation.error) {
    return {
      statusCode: 400,
      body: {
        message: validation.error,
      },
    };
  }

  const {
    customerName,
    email,
    paymentMethod: paymentMethodCode,
    items,
  } = validation.values;

  if (paymentMethodCode !== 'paypal') {
    return {
      statusCode: 400,
      body: {
        message: 'Invalid payment method.',
      },
    };
  }

  const selectedClassIds = items.map(
    (item) => item.classId
  );

  const selectedClasses =
    await findClassesForCheckout(selectedClassIds);

  if (!selectedClasses.length) {
    return {
      statusCode: 400,
      body: {
        message: 'No valid classes selected.',
      },
    };
  }

  const paymentMethod =
    await findPaymentMethod('paypal');

  if (!paymentMethod?.isActive) {
    return {
      statusCode: 400,
      body: {
        message: 'PayPal is unavailable.',
      },
    };
  }

  const subtotal = selectedClasses.reduce(
    (total, classItem) => total + classPrice(classItem),
    0
  );

  const totalAmount = Number(subtotal.toFixed(2));

  const orderNumber = await nextOrderId();

  /*
   * Create Order FIRST
   */

  const order = await createOrder({
    orderNumber,
    customerName,
    email,
    subtotal,
    totalAmount,
    selectedClasses,
  });

  /*
   * Create PayPal Order
   */

  const paypal =
    await createPaypalOrder({
      orderId: orderNumber,
      totalAmount,
      currency: 'USD',
    });

  /*
   * Save Payment
   */

  await prisma.payment.create({
    data: {
      orderId: order.id,

      paymentMethodId: paymentMethod.id,

      amountCents:
        amountToCents(totalAmount),

      currency: 'USD',

      status: 'PENDING',

      externalReference:
        paypal.orderId,

      notes: JSON.stringify({
        gateway: 'PayPal',
      }),
    },
  });

  return {
    statusCode: 201,

    body: {
      success: true,

      paymentMethod: 'paypal',

      orderId: order.orderNumber,

      amount: totalAmount,

      currency: 'USD',

      checkoutUrl:
        paypal.checkoutUrl,

      paypalOrderId:
        paypal.orderId,
    },
  };
}

/* ----------------------------------------------------------
   Capture PayPal Payment
---------------------------------------------------------- */

export async function capturePaypalCheckout(body) {
  const { paypalOrderId } = body;

  if (!paypalOrderId) {
    return {
      statusCode: 400,
      body: {
        message: 'PayPal Order ID is required.',
      },
    };
  }

  /*
   * Capture payment from PayPal
   */
  const capture =
    await capturePaypalOrder(paypalOrderId);

  /*
   * Find payment using PayPal Order ID
   */
  const payment = await prisma.payment.findFirst({
    where: {
      externalReference: paypalOrderId,
    },
    include: {
      order: true,
    },
  });

  if (!payment) {
    return {
      statusCode: 404,
      body: {
        message: 'Payment not found.',
      },
    };
  }

  /*
   * Update Payment
   */
  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: 'PAID',
      verifiedAt: new Date(),
      notes: JSON.stringify({
        gateway: 'PayPal',
        captureId: capture.captureId,
        payer: capture.payer,
      }),
    },
  });

  /*
   * Update Order
   */
  await prisma.order.update({
    where: {
      id: payment.orderId,
    },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message: 'Payment completed successfully.',
      captureId: capture.captureId,
      payer: capture.payer,
      orderNumber: payment.order.orderNumber,
    },
  };
}