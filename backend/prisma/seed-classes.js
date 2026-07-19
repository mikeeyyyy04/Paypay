import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const classes = [
  {
    slug: 'advanced-lincoln-douglas-debate-class',
    title: 'Advanced Lincoln Douglas Debate Class',
    category: 'Debate',
    instructorName: 'Lincoln Douglas Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 18,
    status: 'PUBLISHED',
    description: 'Advanced Lincoln Douglas debate strategy and practice.',
  },
  {
    slug: 'advanced-team-policy-debate-class',
    title: 'Advanced Team Policy Debate Class',
    category: 'Debate',
    instructorName: 'Team Policy Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 14,
    status: 'PUBLISHED',
    description: 'Advanced team policy debate systems, research, and execution.',
  },
  {
    slug: 'parli-protocol',
    title: 'Parli Protocol',
    category: 'Parliamentary Debate',
    instructorName: 'Parli Faculty',
    scheduleLabel: 'Monthly',
    priceCents: 9900,
    capacity: 30,
    enrolled: 11,
    status: 'PUBLISHED',
    description: 'Monthly parliamentary protocol training.',
  },
  {
    slug: 'debate-intro-class',
    title: 'Debate Intro Class',
    category: 'Debate',
    instructorName: 'Intro Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 21,
    status: 'PUBLISHED',
    description: 'Introductory foundations for new debate students.',
  },
  {
    slug: 'nihd-speech-class',
    title: 'NIHD Speech Class',
    category: 'Speech',
    instructorName: 'Speech Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 10,
    status: 'PUBLISHED',
    description: 'Speech class for NIHD competitors.',
  },
  {
    slug: 'ultimate-ld-debate-class',
    title: 'Ultimate LD Debate Class',
    category: 'Debate',
    instructorName: 'Lincoln Douglas Faculty',
    scheduleLabel: 'Self-paced',
    priceCents: 19900,
    capacity: 30,
    enrolled: 19,
    status: 'PUBLISHED',
    description: 'Ultimate Lincoln Douglas debate class.',
  },
];

for (const classItem of classes) {
  await prisma.class.upsert({
    where: { slug: classItem.slug },
    update: {
      title: classItem.title,
      category: classItem.category,
      instructorName: classItem.instructorName,
      scheduleLabel: classItem.scheduleLabel,
      priceCents: classItem.priceCents,
      capacity: classItem.capacity,
      enrolled: classItem.enrolled,
      status: classItem.status,
      description: classItem.description,
      publishedAt: new Date(),
    },
    create: {
      ...classItem,
      publishedAt: new Date(),
    },
  });
}

const count = await prisma.class.count();
console.log(`Seeded classes. Current class count: ${count}`);

await prisma.$disconnect();
