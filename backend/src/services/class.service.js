import { prisma } from '../database/prisma.js';
import { CLASS_STATUS_TO_API, PUBLIC_CLASS_STATUSES } from '../constants/classStatus.js';
import { parseClassPayload } from '../schemas/class.schema.js';
import { createSlug } from '../utils/slug.js';

export function validateClassPayload(body) {
  return parseClassPayload(body);
}

export function sanitizeClass(classItem) {
  const price = classItem.priceCents / 100;
  const status = CLASS_STATUS_TO_API[classItem.status] ?? classItem.status ?? 'Draft';

  return {
    id: String(classItem.id),
    slug: classItem.slug,
    title: classItem.title,
    category: classItem.category,
    instructor: classItem.instructorName,
    schedule: classItem.scheduleLabel,
    price: Number(price.toFixed(2)),
    capacity: classItem.capacity,
    enrolled: classItem.enrolled,
    status,
    description: classItem.description,
    coverImage: classItem.coverImageUrl ?? null,
    createdAt: classItem.createdAt,
    updatedAt: classItem.updatedAt,
  };
}

export async function findPublicClasses() {
  return prisma.class.findMany({
    where: { status: { in: PUBLIC_CLASS_STATUSES } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function findPublicClassBySlug(slugOrId) {
  const lookupConditions = [{ slug: slugOrId }];

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId)) {
    lookupConditions.push({ id: slugOrId });
  }

  return prisma.class.findFirst({
    where: {
      status: { in: PUBLIC_CLASS_STATUSES },
      OR: lookupConditions,
    },
  });
}

export async function findClassesForCheckout(selectedClassIds) {
  return prisma.class.findMany({
    where: {
      id: { in: selectedClassIds },
      status: { in: PUBLIC_CLASS_STATUSES },
    },
  });
}

export function classPrice(classItem) {
  return classItem.priceCents / 100;
}

export async function findAdminClasses() {
  return prisma.class.findMany({
    where: { status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createClass(values) {
  return prisma.class.create({
    data: {
      ...values,
      slug: `${createSlug(values.title)}-${Date.now().toString(36)}`,
    },
  });
}

export async function updateClass(classId, values) {
  return prisma.class.update({
    where: { id: classId },
    data: values,
  });
}

export async function deleteClass(classId) {
  const orderItemCount = await prisma.orderItem.count({ where: { classId } });

  if (orderItemCount > 0) {
    return prisma.class.update({
      where: { id: classId },
      data: {
        status: 'CANCELLED',
        publishedAt: null,
      },
    });
  }

  await prisma.class.delete({ where: { id: classId } });
  return null;
}

export async function approveEnrollmentForOrder(order) {
  const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });

  for (const item of items) {
    const classItem = await prisma.class.findUnique({ where: { id: item.classId } });

    if (!classItem || classItem.enrolled >= classItem.capacity) {
      continue;
    }

    const enrolled = classItem.enrolled + 1;
    await prisma.class.update({
      where: { id: classItem.id },
      data: {
        enrolled,
        status: enrolled >= classItem.capacity ? 'FULL' : classItem.status,
      },
    });
  }
}


