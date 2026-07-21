import { z } from 'zod';

export const manualCheckoutSchema = z.object({
  customerName: z.string().trim().min(1, 'customerName, email, and at least one class item are required.'),
  email: z.string().trim().email('customerName, email, and at least one class item are required.').transform((value) => value.toLowerCase()),
  paymentMethod: z.enum(['gcash', 'paypal', 'bank_transfer']).default('gcash'),
  bankAccountId: z.string().optional(),
  items: z.array(z.object({ classId: z.string().trim().min(1) })).min(1, 'customerName, email, and at least one class item are required.'),
});

export function parseManualCheckoutPayload(body) {
  const result = manualCheckoutSchema.safeParse(body);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid checkout payload.' };
  }

  return { values: result.data };
}
