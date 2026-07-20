import { prisma } from '../database/prisma.js';

export const defaultClasses = [
  {
    slug: 'advanced-lincoln-douglas-debate',
    title: 'Advanced Lincoln Douglas Debate',
    category: 'Lincoln Douglas',
    instructorName: 'Lincoln Douglas Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 18,
    status: 'PUBLISHED',
    description: 'Advanced Lincoln Douglas debate strategy and practice for experienced competitors.',
  },
  {
    slug: 'advanced-team-policy-debate',
    title: 'Advanced Team Policy Debate',
    category: 'Team Policy',
    instructorName: 'Team Policy Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 14,
    status: 'PUBLISHED',
    description: 'Advanced team policy debate systems, research, cross-examination, and round execution.',
  },
  {
    slug: 'parli-protocol',
    title: 'Parli Protocol',
    category: 'Parli',
    instructorName: 'Parli Faculty',
    scheduleLabel: 'Monthly',
    priceCents: 9900,
    capacity: 30,
    enrolled: 11,
    status: 'PUBLISHED',
    description: 'Monthly parliamentary debate protocol training with practical case and round work.',
  },
  {
    slug: 'debate-intro',
    title: 'Debate Intro',
    category: 'Debate 101',
    instructorName: 'Intro Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 21,
    status: 'PUBLISHED',
    description: 'Introductory foundations for students, parents, and teachers who are new to academic debate.',
  },
  {
    slug: 'speech-class',
    title: 'Speech Class',
    category: 'Speech',
    instructorName: 'Speech Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 10,
    status: 'PUBLISHED',
    description: 'Speech training for limited prep, platform, and interpretation events.',
  },
  {
    slug: 'ultimate-lincoln-douglas-debate',
    title: 'Ultimate Lincoln Douglas Debate',
    category: 'Lincoln Douglas',
    instructorName: 'Lincoln Douglas Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 19,
    status: 'PUBLISHED',
    description: 'Comprehensive Lincoln Douglas debate training for students preparing to compete at a high level.',
  },
];

export async function seedDefaultClasses() {
  await prisma.$executeRawUnsafe('ALTER TABLE classes ADD COLUMN IF NOT EXISTS cover_image_url text');

  for (const classItem of defaultClasses) {
    const existingClass = await prisma.class.findUnique({ where: { slug: classItem.slug } });

    if (existingClass) {
      continue;
    }

    await prisma.class.create({
      data: {
        ...classItem,
        publishedAt: new Date(),
      },
    });
  }
}

