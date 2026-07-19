import express from 'express';
import 'dotenv/config';
import { authRoutes } from './routes/auth.routes.js';
import { checkoutRoutes } from './routes/checkout.routes.js';
import { adminClassRoutes, publicClassRoutes } from './routes/class.routes.js';
import { adminOrderRoutes, publicOrderRoutes } from './routes/order.routes.js';
import { adminPaymentRoutes, publicPaymentRoutes } from './routes/payment.routes.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const PORT = Number(process.env.PORT ?? 3000);
const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/public/classes', publicClassRoutes);
app.use('/api/public/checkout', checkoutRoutes);
app.use('/api/public/orders', publicOrderRoutes);
app.use('/api/public', publicPaymentRoutes);
app.use('/api/admin/classes', adminClassRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin', adminPaymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Paypay backend running at http://localhost:${PORT}`);
});
