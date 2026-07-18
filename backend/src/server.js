import http from 'node:http';
import { createToken, findUserByToken, publicUser } from './auth.js';
import { readDatabase, writeDatabase } from './database.js';
import { createBankTransferSession } from './gateway.js';
import { parseToken, readJsonBody, sendJson, sendNoContent } from './http.js';

const PORT = Number(process.env.PORT ?? 3000);

function sanitizeClass(classItem) {
  return {
    id: classItem.id,
    title: classItem.title,
    category: classItem.category,
    instructor: classItem.instructor,
    schedule: classItem.schedule,
    price: classItem.price,
    capacity: classItem.capacity,
    enrolled: classItem.enrolled,
    status: classItem.status,
    description: classItem.description,
  };
}

function nextOrderId(database) {
  const sequence = (database.orders?.length ?? 0) + 1001;
  return `PP-${sequence}`;
}

function buildOrderSummary(selectedClasses) {
  return selectedClasses.map((classItem) => classItem.title).join(', ');
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') {
      sendNoContent(request, response);
      return;
    }

    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
    const database = await readDatabase();

    if (request.method === 'GET' && url.pathname === '/api/public/classes') {
      const classes = (database.classes ?? [])
        .filter((classItem) => classItem.status === 'Active')
        .map((classItem) => sanitizeClass(classItem));

      sendJson(request, response, 200, { classes });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/public/checkout/bank-transfer') {
      const body = await readJsonBody(request);
      const customerName = String(body.customerName ?? '').trim();
      const email = String(body.email ?? '').trim().toLowerCase();
      const items = Array.isArray(body.items) ? body.items : [];

      if (!customerName || !email || items.length === 0) {
        sendJson(request, response, 400, {
          message: 'customerName, email, and at least one class item are required.',
        });
        return;
      }

      const selectedClasses = items
        .map((item) => database.classes.find((classItem) => classItem.id === Number(item.classId)))
        .filter(Boolean)
        .filter((classItem) => classItem.status === 'Active');

      if (selectedClasses.length === 0) {
        sendJson(request, response, 400, {
          message: 'No valid active classes found for checkout.',
        });
        return;
      }

      const subtotal = selectedClasses.reduce((total, classItem) => total + Number(classItem.price ?? 0), 0);
      const serviceFee = subtotal * 0.03;
      const totalAmount = Number((subtotal + serviceFee).toFixed(2));
      const orderId = nextOrderId(database);
      const reference = `BT-${Date.now().toString().slice(-6)}`;
      const gatewaySession = createBankTransferSession({
        orderId,
        amount: totalAmount,
        email,
      });

      const orderRecord = {
        id: orderId,
        customer: customerName,
        email,
        classTitle: buildOrderSummary(selectedClasses),
        amount: totalAmount,
        paymentMethod: 'Bank transfer',
        status: 'Pending',
        reference,
        transferDate: new Date().toISOString().slice(0, 10),
        bankName: gatewaySession.bankName,
        notes: 'Awaiting bank transfer settlement.',
        items: selectedClasses.map((classItem) => ({
          classId: classItem.id,
          title: classItem.title,
          price: classItem.price,
        })),
        gateway: gatewaySession,
      };

      if (!Array.isArray(database.orders)) {
        database.orders = [];
      }

      database.orders.unshift(orderRecord);
      await writeDatabase(database);

      sendJson(request, response, 201, {
        orderId,
        amount: totalAmount,
        currency: gatewaySession.currency,
        payment: gatewaySession,
      });
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/public/orders/')) {
      const orderId = decodeURIComponent(url.pathname.replace('/api/public/orders/', ''));
      const order = (database.orders ?? []).find((candidate) => candidate.id === orderId);

      if (!order) {
        sendJson(request, response, 404, { message: 'Order not found.' });
        return;
      }

      sendJson(request, response, 200, {
        id: order.id,
        customer: order.customer,
        email: order.email,
        status: order.status,
        amount: order.amount,
        reference: order.reference,
        items: order.items ?? [],
        payment: order.gateway,
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJsonBody(request);
      const user = database.users.find(
        (candidate) =>
          candidate.email.toLowerCase() === String(body.email ?? '').trim().toLowerCase() &&
          candidate.password === body.password,
      );

      if (!user || user.role !== 'admin') {
        sendJson(request, response, 401, { message: 'Invalid admin credentials.' });
        return;
      }

      const token = createToken();
      database.sessions[token] = user.id;
      await writeDatabase(database);
      sendJson(request, response, 200, { token, user: publicUser(user) });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/me') {
      const user = findUserByToken(database, parseToken(request));

      if (!user) {
        sendJson(request, response, 401, { message: 'Session expired.' });
        return;
      }

      sendJson(request, response, 200, publicUser(user));
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      const token = parseToken(request);

      if (token) {
        delete database.sessions[token];
        await writeDatabase(database);
      }

      sendNoContent(request, response);
      return;
    }

    sendJson(request, response, 404, { message: 'Route not found.' });
  } catch (error) {
    sendJson(request, response, 500, {
      message: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
});

server.listen(PORT, () => {
  console.log(`Paypay backend running at http://localhost:${PORT}`);
});
