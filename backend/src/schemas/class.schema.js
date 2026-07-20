import { z } from 'zod';
import { API_CLASS_STATUSES, CLASS_STATUS_TO_DATABASE } from '../constants/classStatus.js';

const requiredText = (field) => z.string({ required_error: `${field} is required.` }).trim().min(1, `${field} is required.`);

export const classPayloadSchema = z.object({
  title: requiredText('Title'),
  category: requiredText('Category'),
  instructor: requiredText('Instructor'),
  schedule: requiredText('Schedule'),
  description: requiredText('Description'),
  price: z.coerce.number().finite().min(0, 'Price must be zero or greater.'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1.'),
  enrolled: z.coerce.number().int().min(0, 'Enrolled must be between 0 and capacity.').default(0),
  status: z.enum(API_CLASS_STATUSES, {
    errorMap: () => ({ message: 'Status must be Draft, Active, Full, or Archived.' }),
  }).default('Draft'),
}).refine((values) => values.enrolled <= values.capacity, {
  path: ['enrolled'],
  message: 'Enrolled must be between 0 and capacity.',
});

export function parseClassPayload(body) {
  const result = classPayloadSchema.safeParse(body);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid class payload.' };
  }

  const values = result.data;

  return {
    values: {
      title: values.title,
      category: values.category,
      description: values.description,
      instructorName: values.instructor,
      scheduleLabel: values.schedule,
      capacity: values.capacity,
      enrolled: values.enrolled,
      priceCents: Math.round(values.price * 100),
      status: CLASS_STATUS_TO_DATABASE[values.status],
      publishedAt: values.status === 'Active' ? new Date() : null,
    },
  };
}

