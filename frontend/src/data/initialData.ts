import img1 from '../assets/courses/img1.jpg';
import img2 from '../assets/courses/img2.jpg';
import img3 from '../assets/courses/img3.jpg';
import img4 from '../assets/courses/img4.jpg';
import img5 from '../assets/courses/img5.jpg';
import img6 from '../assets/courses/img6.jpg';
import type { ClassFormValues, ClassItem, OrderItem, PublicClass, PricingOption } from '../types';

export const emptyClassForm: ClassFormValues = {
  title: '',
  category: '',
  instructor: '',
  schedule: '',
  price: 0,
  capacity: 12,
  status: 'Draft',
  description: '',
  coverImage: null,
};

export const initialClasses: ClassItem[] = [
  {
    id: 'advanced-lincoln-douglas-debate-class',
    slug: 'advanced-lincoln-douglas-debate-class',
    title: 'Advanced Lincoln Douglas Debate Class',
    category: 'Debate',
    instructor: 'Lincoln Douglas Faculty',
    schedule: 'Self-paced',
    price: 199,
    capacity: 30,
    enrolled: 18,
    status: 'Active',
    description: 'Advanced Lincoln Douglas debate strategy and practice.',
  },
  {
    id: 'advanced-team-policy-debate-class',
    slug: 'advanced-team-policy-debate-class',
    title: 'Advanced Team Policy Debate Class',
    category: 'Debate',
    instructor: 'Team Policy Faculty',
    schedule: 'Self-paced',
    price: 199,
    capacity: 30,
    enrolled: 14,
    status: 'Active',
    description: 'Advanced team policy debate systems, research, and execution.',
  },
  {
    id: 'parli-protocol',
    slug: 'parli-protocol',
    title: 'Parli Protocol',
    category: 'Parliamentary Debate',
    instructor: 'Parli Faculty',
    schedule: 'Monthly',
    price: 99,
    capacity: 30,
    enrolled: 11,
    status: 'Active',
    description: 'Monthly parliamentary protocol training.',
  },
  {
    id: 'debate-intro-class',
    slug: 'debate-intro-class',
    title: 'Debate Intro Class',
    category: 'Debate',
    instructor: 'Intro Faculty',
    schedule: 'Self-paced',
    price: 199,
    capacity: 30,
    enrolled: 21,
    status: 'Active',
    description: 'Introductory foundations for new debate students.',
  },
  {
    id: 'nihd-speech-class',
    slug: 'nihd-speech-class',
    title: 'NIHD Speech Class',
    category: 'Speech',
    instructor: 'Speech Faculty',
    schedule: 'Self-paced',
    price: 199,
    capacity: 30,
    enrolled: 10,
    status: 'Active',
    description: 'Speech class for NIHD competitors.',
  },
  {
    id: 'ultimate-ld-debate-class',
    slug: 'ultimate-ld-debate-class',
    title: 'Ultimate LD Debate Class',
    category: 'Debate',
    instructor: 'Lincoln Douglas Faculty',
    schedule: 'Self-paced',
    price: 199,
    capacity: 30,
    enrolled: 19,
    status: 'Active',
    description: 'Ultimate Lincoln Douglas debate class.',
  },
];

export const publicCourses: PublicClass[] = [
  {
    id: 'advanced-lincoln-douglas-debate',
    slug: 'advanced-lincoln-douglas-debate',
    title: 'Advanced Lincoln Douglas Debate Class',
    category: 'Debate',
    instructor: 'Lincoln Douglas Faculty',
    schedule: 'Tuesdays @ 10:30AM-11:30AM Pacific Time',
    price: 199,
    pricingOptions: [
      { key: 'quarter', label: 'Quarter', amount: 199 },
      { key: 'semester', label: 'Semester', amount: 299 },
      { key: 'full-year', label: 'Full Year', amount: 599 },
    ],
    capacity: 30,
    enrolled: 18,
    status: 'Active',
    description: `Resolved: Incrementalism is superior to radicalism as a means to achieve social change.
Resolved: Practical skills should be valued over theoretical knowledge.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $599 per student

This course is taught by one of the top Lincoln Douglas debate coaches in all of Stoa. Griffith Vertican's students have made it to the final round of nationals seven times, and have won the national title five times, including back-to-back in 2018, 2019, 2021, and 2022.

This class will focus on how to become a top Lincoln Douglas debater and improve your LD debate skills. It will train students in skills including how to write better cases and applications, better use of evidence and cross-examination, and voting issues that work well with your cases.

* Class is an hour long. However, Coach Griffith often graciously offers additional time to work with students who need to work on cases, speeches, and arguments - often 15-30 minutes extra, especially on weeks when they're doing practices.
`,
    coverImage: img1,
  },
  {
    id: 'advanced-team-policy-debate',
    slug: 'advanced-team-policy-debate',
    title: 'Advanced Team Policy Debate Class',
    category: 'Debate',
    instructor: 'Team Policy Faculty',
    schedule: 'Wednesdays @ 6:00PM-7:30PM Pacific Time',
    price: 199,
    pricingOptions: [
      { key: 'quarter', label: 'Quarter', amount: 199 },
      { key: 'semester', label: 'Semester', amount: 299 },
      { key: 'full-year', label: 'Full Year', amount: 599 },
    ],
    capacity: 30,
    enrolled: 14,
    status: 'Active',
    description: `Resolved: Evidence and analysis should always drive case construction.
Resolved: Strategic offense beats reactive defense in competitive policy debate.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $599 per student

This course helps competitors build research, theory, and flow skills for tournament success. It includes focused drills on cross-examination, blocks, and the most current policy topics.

* Students receive weekly coaching on case development, argument strategy, and delivery.
`,
    coverImage: img2,
  },
  {
    id: 'parli-protocol',
    slug: 'parli-protocol',
    title: 'Parli Protocol Class',
    category: 'Parliamentary',
    instructor: 'Parli Faculty',
    schedule: 'Mondays @ 4:00PM-5:30PM Pacific Time',
    price: 99,
    pricingOptions: [
      { key: 'quarter', label: 'Quarter', amount: 99 },
      { key: 'semester', label: 'Semester', amount: 199 },
      { key: 'full-year', label: 'Full Year', amount: 399 },
    ],
    capacity: 30,
    enrolled: 11,
    status: 'Active',
    description: `Resolved: Rapid reasoning and agile argumentation win more rounds in parliamentary debate.
Resolved: Teamwork and case adaptability make the best parli teams unstoppable.
- Quarter Cost: $99 per student
- Semester Cost: $199 per student
- Full Year Cost: $399 per student

Monthly parliamentary debate protocol training with practical case and round work. This course features live practice debates and judge feedback.

* Students will learn how to quickly build arguments, manage points of information, and win speaker points.
`,
    coverImage: img3,
  },
  {
    id: 'debate-intro',
    slug: 'debate-intro',
    title: 'Debate Intro Class',
    category: 'Debate',
    instructor: 'Intro Faculty',
    schedule: 'Saturdays @ 1:00PM-2:30PM Pacific Time',
    price: 149,
    pricingOptions: [
      { key: 'quarter', label: 'Quarter', amount: 149 },
      { key: 'semester', label: 'Semester', amount: 249 },
      { key: 'full-year', label: 'Full Year', amount: 449 },
    ],
    capacity: 30,
    enrolled: 21,
    status: 'Active',
    description: `Resolved: Learning debate basics early builds confidence for all speaking events.
Resolved: Strong foundations in argument structure make advanced skills easier to master.
- Quarter Cost: $149 per student
- Semester Cost: $249 per student
- Full Year Cost: $449 per student

Introductory foundations for students, parents, and teachers who are new to academic debate. This course covers case writing, basic refutation, and public speaking practice.

* Designed for new students who want a supportive learning environment and steady progress.
`,
    coverImage: img4,
  },
  {
    id: 'speech-class',
    slug: 'speech-class',
    title: 'Speech Class',
    category: 'Speech',
    instructor: 'Speech Faculty',
    schedule: 'Thursdays @ 3:00PM-4:30PM Pacific Time',
    price: 199,
    pricingOptions: [
      { key: 'quarter', label: 'Quarter', amount: 199 },
      { key: 'semester', label: 'Semester', amount: 299 },
      { key: 'full-year', label: 'Full Year', amount: 499 },
    ],
    capacity: 30,
    enrolled: 10,
    status: 'Active',
    description: `Resolved: Presentation and storytelling are as important as content in speech competitions.
Resolved: Strong delivery wins audience and judge attention every time.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $499 per student

Speech training for limited prep, platform, and interpretation events. This class builds confidence, vocal tone, and argument clarity.

* Students practice pieces regularly and receive individualized coaching on delivery and pacing.
`,
    coverImage: img5,
  },
  {
    id: 'ultimate-lincoln-douglas-debate',
    slug: 'ultimate-lincoln-douglas-debate',
    title: 'Ultimate Lincoln Douglas Debate Class',
    category: 'Debate',
    instructor: 'Lincoln Douglas Faculty',
    schedule: 'Fridays @ 5:00PM-6:30PM Pacific Time',
    price: 199,
    pricingOptions: [
      { key: 'quarter', label: 'Quarter', amount: 199 },
      { key: 'semester', label: 'Semester', amount: 299 },
      { key: 'full-year', label: 'Full Year', amount: 599 },
    ],
    capacity: 30,
    enrolled: 19,
    status: 'Active',
    description: `Resolved: Preparing with elite methods gives LD competitors a decisive edge.
Resolved: The best cases are the ones that combine evidence, philosophy, and impact.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $599 per student

Comprehensive Lincoln Douglas debate training for students preparing to compete at a high level. This program includes advanced case structure, argument depth, and judge adaptation.

* Designed for students ready to make nationals and win at the highest competitive levels.
`,
    coverImage: img6,
  },
];

export const initialOrders: OrderItem[] = [
  {
    id: 'PP-1001',
    customer: 'Ava Johnson',
    email: 'ava@example.com',
    classTitle: 'Beginner Guitar',
    amount: 120,
    paymentMethod: 'Bank transfer',
    status: 'Pending',
    reference: 'PT-39281',
    transferDate: '2026-07-15',
    bankName: 'BPI',
    notes: 'Awaiting deposit match.',
  },
  {
    id: 'PP-1002',
    customer: 'Noah Kim',
    email: 'noah@example.com',
    classTitle: 'Creative Writing Lab',
    amount: 95,
    paymentMethod: 'Bank transfer',
    status: 'Reviewing',
    reference: 'PT-39282',
    transferDate: '2026-07-16',
    bankName: 'BDO',
    notes: 'Reference amount matches, receipt image pending.',
  },
  {
    id: 'PP-1003',
    customer: 'Sophia Martinez',
    email: 'sophia@example.com',
    classTitle: 'Kids Coding Club',
    amount: 150,
    paymentMethod: 'Bank transfer',
    status: 'Paid',
    reference: 'PT-39283',
    transferDate: '2026-07-14',
    bankName: 'UnionBank',
    notes: 'Verified against bank statement.',
    verifiedBy: 'Admin User',
    verifiedAt: '2026-07-14',
  },
];

