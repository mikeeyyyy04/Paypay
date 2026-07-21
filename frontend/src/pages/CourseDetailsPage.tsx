import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { publicApi } from '../api';
import type { CartItem, PublicClass } from '../types';
import { publicCourses } from '../data/initialData';
import defaultCourse from '../assets/courses/img1.jpg';

type DescriptionBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'resolved'; text: string }
  | { type: 'note'; text: string }
  | { type: 'list'; items: string[] };

type PricingOption = {
  key: string;
  label: string;
  amount: number;
};

function parsePricingOptions(description: string): PricingOption[] {
  const options: PricingOption[] = [];

  description
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ''))
    .forEach((line) => {
      const match = line.match(/^(Quarter|Semester|Full Year|Full-Year|Full Year Cost|Quarter Cost|Semester Cost|Full Year Cost)\s*[:\-]?\s*\$?([\d,]+(?:\.\d+)?)/i);
      if (!match) {
        return;
      }

      let label = match[1].replace(/\s*Cost/i, '').replace(/[- ]/g, ' ').trim();
      if (/quarter/i.test(label)) {
        label = 'Quarter';
      } else if (/semester/i.test(label)) {
        label = 'Semester';
      } else if (/full\s*-?\s*year/i.test(label)) {
        label = 'Full Year';
      }

      const amount = Number(match[2].replace(/,/g, ''));
      if (!Number.isNaN(amount)) {
        options.push({
          key: label.toLowerCase().replace(/\s+/g, '-'),
          label,
          amount,
        });
      }
    });

  return options;
}

function parseCourseDescription(description: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  }

  description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) {
        flushList();
        return;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        listItems.push(line.slice(2).trim());
        return;
      }

      flushList();

      if (/^resolved:/i.test(line)) {
        blocks.push({ type: 'resolved', text: line });
        return;
      }

      if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
        blocks.push({ type: 'note', text: line.slice(1, -1).trim() });
        return;
      }

      blocks.push({ type: 'paragraph', text: line });
    });

  flushList();

  return blocks;
}

type CourseDetailOverride = {
  title?: string;
  schedule?: string;
  instructor?: string;
  coverImage?: string | null;
  description?: string;
};

const COURSE_DETAIL_OVERRIDES: Record<string, CourseDetailOverride> = {
  'advanced-lincoln-douglas-debate': {
    title: 'Advanced Lincoln Douglas Debate Class',
    schedule: 'Tuesdays @ 10:30AM-11:30AM Pacific Time',
    instructor: 'Lincoln Douglas Faculty',
    description: `Resolved: Incrementalism is superior to radicalism as a means to achieve social change.
Resolved: Practical skills should be valued over theoretical knowledge.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $599 per student

This course is taught by one of the top Lincoln Douglas debate coaches in all of Stoa. Griffith Vertican's students have made it to the final round of nationals seven times, and have won the national title five times, including back-to-back in 2018, 2019, 2021, and 2022.

This class will focus on how to become a top Lincoln Douglas debater and improve your LD debate skills. It will train students in skills including how to write better cases and applications, better use of evidence and cross-examination, and voting issues that work well with your cases.

* Class is an hour long. However, Coach Griffith often graciously offers additional time to work with students who need to work on cases, speeches, and arguments - often 15-30 minutes extra, especially on weeks when they're doing practices.
`,
  },
  'advanced-team-policy-debate': {
    title: 'Advanced Team Policy Debate Class',
    schedule: 'Wednesdays @ 6:00PM-7:30PM Pacific Time',
    instructor: 'Team Policy Faculty',
    description: `Resolved: Evidence and analysis should always drive case construction.
Resolved: Strategic offense beats reactive defense in competitive policy debate.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $599 per student

This course helps competitors build research, theory, and flow skills for tournament success. It includes focused drills on cross-examination, blocks, and the most current policy topics.

* Students receive weekly coaching on case development, argument strategy, and delivery.
`,
  },
  'parli-protocol': {
    title: 'Parli Protocol Class',
    schedule: 'Mondays @ 4:00PM-5:30PM Pacific Time',
    instructor: 'Parli Faculty',
    description: `Resolved: Rapid reasoning and agile argumentation win more rounds in parliamentary debate.
Resolved: Teamwork and case adaptability make the best parli teams unstoppable.
- Quarter Cost: $99 per student
- Semester Cost: $199 per student
- Full Year Cost: $399 per student

Monthly parliamentary debate protocol training with practical case and round work. This course features live practice debates and judge feedback.

* Students will learn how to quickly build arguments, manage points of information, and win speaker points.
`,
  },
  'debate-intro': {
    title: 'Debate Intro Class',
    schedule: 'Saturdays @ 1:00PM-2:30PM Pacific Time',
    instructor: 'Intro Faculty',
    description: `Resolved: Learning debate basics early builds confidence for all speaking events.
Resolved: Strong foundations in argument structure make advanced skills easier to master.
- Quarter Cost: $149 per student
- Semester Cost: $249 per student
- Full Year Cost: $449 per student

Introductory foundations for students, parents, and teachers who are new to academic debate. This course covers case writing, basic refutation, and public speaking practice.

* Designed for new students who want a supportive learning environment and steady progress.
`,
  },
  'speech-class': {
    title: 'Speech Class',
    schedule: 'Thursdays @ 3:00PM-4:30PM Pacific Time',
    instructor: 'Speech Faculty',
    description: `Resolved: Presentation and storytelling are as important as content in speech competitions.
Resolved: Strong delivery wins audience and judge attention every time.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $499 per student

Speech training for limited prep, platform, and interpretation events. This class builds confidence, vocal tone, and argument clarity.

* Students practice pieces regularly and receive individualized coaching on delivery and pacing.
`,
  },
  'ultimate-lincoln-douglas-debate': {
    title: 'Ultimate Lincoln Douglas Debate Class',
    schedule: 'Fridays @ 5:00PM-6:30PM Pacific Time',
    instructor: 'Lincoln Douglas Faculty',
    description: `Resolved: Preparing with elite methods gives LD competitors a decisive edge.
Resolved: The best cases are the ones that combine evidence, philosophy, and impact.
- Quarter Cost: $199 per student
- Semester Cost: $299 per student
- Full Year Cost: $599 per student

Comprehensive Lincoln Douglas debate training for students preparing to compete at a high level. This program includes advanced case structure, argument depth, and judge adaptation.

* Designed for students ready to make nationals and win at the highest competitive levels.
`,
  },
};

type CourseDetailsPageProps = {
  cartCount: number;
  onAddToCart: (cartItem: CartItem) => void;
};

export function CourseDetailsPage({
  cartCount: _cartCount,
  onAddToCart,
}: CourseDetailsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<PublicClass | null>(null);
  const [allCourses, setAllCourses] = useState<PublicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedLength, setSelectedLength] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {

    let mounted = true;

    async function loadCourse() {
      if (!id) {
        setError('Course not found.');
        setLoading(false);
        return;
      }

      try {
        const [courseResponse, classesResponse] = await Promise.all([
          publicApi.getClass(id),
          publicApi.listClasses(),
        ]);

        if (mounted) {
          setCourse(courseResponse.classItem);
          setAllCourses(classesResponse.classes);
        }
      } catch (loadError) {
        if (mounted) {
          const fallbackCourse = publicCourses.find((item) => item.slug === id || item.id === id);
          if (fallbackCourse) {
            setCourse(fallbackCourse);
            setAllCourses(publicCourses);
            setError('');
          } else {
            setError(loadError instanceof Error ? loadError.message : 'Course not found.');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [id]);

  function handleRegister() {
    if (!course) {
      return;
    }

    setShowModal(true);
  }

  function handleModalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course) {
      return;
    }

    const cartItem: CartItem = {
      classId: course.id,
      title: course.title,
      instructor: course.instructor,
      schedule: course.schedule,
      price: selectedAmount,
      quantity,
      pricingOptionKey: currentOption?.key,
      pricingOptionLabel: currentOption?.label,
    };

    onAddToCart(cartItem);
    setShowModal(false);
    setFormValues({ firstName: '', lastName: '', email: '', phone: '' });
  }

  const detailOverride = course ? COURSE_DETAIL_OVERRIDES[course.slug] : undefined;
  const courseDescription = detailOverride?.description ?? course?.description ?? '';
  const courseSchedule = detailOverride?.schedule ?? course?.schedule;
  const courseInstructor = detailOverride?.instructor ?? course?.instructor;
  const courseCoverImage = detailOverride?.coverImage ?? course?.coverImage;
  const courseTitle = detailOverride?.title ?? course?.title;
  const coursePrice = course?.price ?? 0;
  const coursePricingOptions = course?.pricingOptions ?? [];

  const pricingOptions = useMemo(() => {
    if (coursePricingOptions.length > 0) {
      return coursePricingOptions;
    }

    const parsed = parsePricingOptions(courseDescription);
    if (parsed.length > 0) {
      return parsed;
    }

    return [
      { key: 'quarter', label: 'Quarter', amount: coursePrice },
      { key: 'semester', label: 'Semester', amount: Math.round(coursePrice * 1.5) },
      { key: 'full-year', label: 'Full Year', amount: Math.round(coursePrice * 3) },
    ];
  }, [courseDescription, coursePrice, coursePricingOptions]);

  const currentOption = pricingOptions.find((option) => option.key === selectedLength);
  const minPrice = useMemo(
    () => pricingOptions.reduce((minimum, option) => Math.min(minimum, option.amount), coursePrice),
    [coursePrice, pricingOptions],
  );
  const selectedAmount = currentOption?.amount ?? minPrice;
  const totalPrice = selectedAmount * quantity;
  const totalLabel = currentOption ? `Total: USD ${totalPrice.toFixed(2)}` : `from USD ${minPrice.toFixed(2)}`;

  useEffect(() => {
    if (!selectedLength && pricingOptions.length > 0) {
      setSelectedLength(pricingOptions[0].key);
    }
  }, [pricingOptions, selectedLength]);

  const descriptionBlocks = course ? parseCourseDescription(courseDescription) : [];

  const currentIndex = course
    ? allCourses.findIndex((item) => item.id === course.id || item.slug === course.slug)
    : -1;
  const previousCourse = currentIndex > 0 ? allCourses[currentIndex - 1] : null;
  const nextCourse = currentIndex >= 0 && currentIndex < allCourses.length - 1 ? allCourses[currentIndex + 1] : null;

  const handleNavigateToCourse = (courseSlug: string) => {
    navigate(`/course/${courseSlug}`);
  };

  if (loading) {
    return (
      <main className="course-details-page">
        <div className="course-error">
          <p>Loading course...</p>
        </div>
      </main>
    );
  }

  if (!course || error) {
    return (
      <main className="course-details-page">
        <div className="course-error">
          <h2>Course Not Found</h2>
          <p>{error || 'Course not found.'}</p>
          <Link to="/classes" className="hero-primary-btn">
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="course-details-page product-course-page">
      <div className="product-course-shell">
        <div className="product-course-topline">
          <div className="product-course-breadcrumb">
            <Link to="/classes">Register</Link>
            <span>&gt;</span>
            <span>{course.title}</span>
          </div>
          <div className="product-course-nav">
            <button
              type="button"
              className="product-course-nav-button"
              disabled={!previousCourse}
              onClick={() => previousCourse && handleNavigateToCourse(previousCourse.slug)}
            >
              ‹ Previous
            </button>
            <button
              type="button"
              className="product-course-nav-button"
              disabled={!nextCourse}
              onClick={() => nextCourse && handleNavigateToCourse(nextCourse.slug)}
            >
              Next ›
            </button>
          </div>
        </div>

        <section className="product-course-layout" aria-label={`${course.title} details`}>
          <div className="product-course-media">
            <img src={courseCoverImage ?? defaultCourse} alt={courseTitle} />
          </div>

          <div className="product-course-copy">
            <div className="product-course-header">
              <h1>{courseTitle}</h1>
            </div>

            {currentOption ? (
              <p className="product-course-subprice">USD {currentOption.amount.toFixed(2)} per student</p>
            ) : (
              <p className="product-course-subprice">from USD {minPrice.toFixed(2)}</p>
            )}
            <p className="product-course-total-label">{totalLabel}</p>

            <div className="product-course-schedule-group">
              <span className="product-course-schedule-label">DATES & TIMES:</span>
              <span className="product-course-schedule">{course.schedule}</span>
            </div>

            <div className="product-course-meta-row">
              <span>{course.instructor}</span>
              <span>{course.capacity} students</span>
            </div>

            <div className="product-course-body">
              {descriptionBlocks.map((block, index) => {
                if (block.type === 'list') {
                  return (
                    <ul key={`description-${index}`}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === 'resolved') {
                  const [, detail = block.text] = block.text.split(/resolved:/i);

                  return (
                    <p key={`description-${index}`} className="product-course-resolved">
                      <strong>Resolved:</strong>
                      {detail}
                    </p>
                  );
                }

                return (
                  <p
                    key={`description-${index}`}
                    className={block.type === 'note' ? 'product-course-note' : undefined}
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>

            <form className="product-course-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>LENGTH:</span>
                <select value={selectedLength} onChange={(event) => setSelectedLength(event.target.value)}>
                  <option value="" disabled>Select Length</option>
                  {pricingOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>QUANTITY:</span>
                <input
                  min="1"
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                />
              </label>

              <div className="product-course-total">
                <span>{totalLabel}</span>
              </div>

              <button type="button" onClick={handleRegister}>REGISTER</button>
            </form>
          </div>
        </section>
      </div>

      {showModal ? (
        <div className="registration-modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <div className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="registration-modal-header">
              <div>
                <p className="eyebrow">Class</p>
                <h2 id="registration-modal-title">Register for {course?.title}</h2>
              </div>
              <button className="registration-close" type="button" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form className="registration-form" onSubmit={handleModalSubmit}>
              <label>
                Student First <span>(required)</span>
                <input
                  value={formValues.firstName}
                  onChange={(event) => setFormValues((current) => ({ ...current, firstName: event.target.value }))}
                  required
                />
              </label>

              <label>
                Student Last <span>(required)</span>
                <input
                  value={formValues.lastName}
                  onChange={(event) => setFormValues((current) => ({ ...current, lastName: event.target.value }))}
                  required
                />
              </label>

              <label>
                Student Email <span>(required)</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>

              <label>
                Student Phone
                <input
                  value={formValues.phone}
                  onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>

              <p className="registration-note">
                Your registration will not be received until you have gone to the "Cart" (in the top right hand corner of the screen) and submitted payment. Please do so at your earliest convenience so as to save your spot.
              </p>

              <button className="registration-submit" type="submit">REGISTER</button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

