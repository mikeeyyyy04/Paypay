import { z } from 'zod';

export const paymentProofSchema = z.object({
  referenceNumber: z.string().trim().min(1, 'Reference number is required.'),
  receiptFile: z.object({
    name: z.string().trim().min(1, 'Receipt file is required.'),
    type: z.string().optional().default(''),
    size: z.coerce.number().optional().default(0),
    dataUrl: z.string().optional().default(''),
  }, { required_error: 'Receipt file is required.' }),
});

export const orderStatusSchema = z.object({
  status: z.enum(['Pending', 'Reviewing', 'Paid', 'Rejected'], {
    errorMap: () => ({ message: 'Status must be Pending, Reviewing, Paid, or Rejected.' }),
  }),
  notes: z.string().optional().default(''),
});

export function parsePaymentProofPayload(body) {
  const result = paymentProofSchema.safeParse(body);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid payment proof payload.' };
  }

  return { values: result.data };
}

export function parseOrderStatusPayload(body, currentOrder) {
  const result = orderStatusSchema.partial({ status: true }).safeParse(body);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid order status payload.' };
  }

  return {
    values: {
      status: result.data.status ?? currentOrder.status,
      notes: String(result.data.notes ?? currentOrder.notes ?? '').trim(),
    },
  };
}
