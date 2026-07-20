import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicClass } from '../types';

type CourseDetailsPageProps = {
  cartCount: number;
  onAddToCart: (classItem: PublicClass) => void;
};

export function CourseDetailsPage({
  cartCount,
  onAddToCart,
}: CourseDetailsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<PublicClass | null>(null);
  const [courses, setCourses] = useState<PublicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      try {
        const response = await publicApi.listClasses();

        if (!mounted) return;

        setCourses(response.classes);

        const selected = response.classes.find(
          (item) => item.id === id,
        );

        if (!selected) {
          setError('Course not found.');
          return;
        }

        setCourse(selected);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load course.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [id]);

  const relatedCourses = useMemo(() => {
    if (!course) return [];

    return courses
      .filter(
        (item) =>
          item.category === course.category &&
          item.id !== course.id,
      )
      .slice(0, 3);
  }, [course, courses]);

  if (loading) {
    return (
      <main className="course-details-page">
        <div className="course-loading">
          Loading course...
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="course-details-page">

        <div className="course-error">

          <h2>Course Not Found</h2>

          <p>{error}</p>

          <Link
            to="/classes"
            className="hero-primary-btn"
          >
            Back to Courses
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="course-details-page">

      {/* ======================================= */}
      {/* HERO */}
      {/* ======================================= */}

      <section className="course-hero">

        <div className="course-hero-left">

          <span className="section-label">
            {course.category}
          </span>

          <h1>
            {course.title}
          </h1>

          <p className="course-description">
            {course.description}
          </p>

          <div className="course-badges">

            <span>
              ⭐ 4.9 Rating
            </span>

            <span>
              👨‍🏫 {course.instructor}
            </span>

            <span>
              👥 Capacity {course.capacity}
            </span>

          </div>

          <div className="hero-buttons">

            <button
              className="hero-primary-btn"
              onClick={() => {
                onAddToCart(course);
                navigate('/checkout');
              }}
            >
              Enroll Now
            </button>

            <Link
              to="/classes"
              className="hero-secondary-btn"
            >
              Browse Courses
            </Link>

          </div>

        </div>

        <div className="course-hero-right">

          <div className="course-image-card">

            <div className="course-image-placeholder">
              🎓
            </div>

          </div>

        </div>

      </section>

      {/* ======================================= */}
      {/* COURSE INFORMATION */}
      {/* ======================================= */}

      <section className="course-main-grid">

        <div className="course-content">

          <div className="content-card">

            <h2>
              About this Course
            </h2>

            <p>
              {course.description}
            </p>

            <p>
              This course is designed to help students
              develop analytical thinking, persuasive
              communication, confidence, and practical
              debate skills through structured lessons
              and instructor-led discussions.
            </p>

          </div>

          <div className="content-card">

            <h2>
              What You'll Learn
            </h2>

            <ul className="learn-list">

              <li>Build persuasive arguments</li>

              <li>Improve public speaking</li>

              <li>Think critically under pressure</li>

              <li>Master debate structure</li>

              <li>Respond to counter arguments</li>

              <li>Increase confidence</li>

            </ul>

          </div>
                    {/* ======================================= */}
          {/* COURSE CURRICULUM */}
          {/* ======================================= */}

          <div className="content-card">

            <h2>
              Course Curriculum
            </h2>

            <div className="curriculum-list">

              <div className="curriculum-item">

                <div className="curriculum-number">
                  01
                </div>

                <div>

                  <h3>
                    Foundations of Debate
                  </h3>

                  <p>
                    Understand debate formats,
                    logical reasoning,
                    and persuasive communication.
                  </p>

                </div>

              </div>

              <div className="curriculum-item">

                <div className="curriculum-number">
                  02
                </div>

                <div>

                  <h3>
                    Argument Construction
                  </h3>

                  <p>
                    Learn how to build
                    strong claims supported
                    by evidence.
                  </p>

                </div>

              </div>

              <div className="curriculum-item">

                <div className="curriculum-number">
                  03
                </div>

                <div>

                  <h3>
                    Rebuttal Strategies
                  </h3>

                  <p>
                    Practice identifying weaknesses
                    and responding effectively.
                  </p>

                </div>

              </div>

              <div className="curriculum-item">

                <div className="curriculum-number">
                  04
                </div>

                <div>

                  <h3>
                    Live Practice Sessions
                  </h3>

                  <p>
                    Participate in guided debates
                    with instructor feedback.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ======================================= */}
          {/* REQUIREMENTS */}
          {/* ======================================= */}

          <div className="content-card">

            <h2>
              Requirements
            </h2>

            <ul className="learn-list">

              <li>
                Laptop or desktop computer
              </li>

              <li>
                Stable internet connection
              </li>

              <li>
                Notebook for exercises
              </li>

              <li>
                Willingness to participate
              </li>

              <li>
                No prior debate experience required
              </li>

            </ul>

          </div>

          {/* ======================================= */}
          {/* INSTRUCTOR */}
          {/* ======================================= */}

          <div className="content-card instructor-card">

            <div className="instructor-avatar">

              👨‍🏫

            </div>

            <div>

              <h2>
                {course.instructor}
              </h2>

              <span className="section-label">
                Lead Instructor
              </span>

              <p>
                Our instructors have extensive
                experience in competitive debate,
                public speaking,
                coaching,
                and mentoring students from
                beginner to advanced levels.
              </p>

            </div>

          </div>

        </div>

        {/* ======================================= */}
        {/* SIDEBAR */}
        {/* ======================================= */}

        <aside className="course-sidebar">

          <div className="sidebar-card">

            <h2>
              PHP {course.price}
            </h2>

            <p>
              One-time Enrollment Fee
            </p>

            <button
              className="hero-primary-btn"
              onClick={() => {
                onAddToCart(course);
                navigate('/checkout');
              }}
            >
              Enroll Now
            </button>

            <div className="sidebar-info">

              <div>

                <strong>
                  Instructor
                </strong>

                <span>
                  {course.instructor}
                </span>

              </div>

              <div>

                <strong>
                  Schedule
                </strong>

                <span>
                  {course.schedule}
                </span>

              </div>

              <div>

                <strong>
                  Capacity
                </strong>

                <span>
                  {course.capacity}
                </span>

              </div>

              <div>

                <strong>
                  Category
                </strong>

                <span>
                  {course.category}
                </span>

              </div>

            </div>

          </div>

          <div className="sidebar-card">

            <h3>
              This Course Includes
            </h3>

            <ul className="sidebar-list">

              <li>
                ✔ Lifetime Access
              </li>

              <li>
                ✔ Instructor Support
              </li>

              <li>
                ✔ Practice Exercises
              </li>

              <li>
                ✔ Downloadable Materials
              </li>

              <li>
                ✔ Certificate of Completion
              </li>

            </ul>

          </div>

          <div className="sidebar-card">

            <h3>
              Course Statistics
            </h3>

            <div className="stats-mini">

              <div>

                <strong>
                  4.9
                </strong>

                <span>
                  Rating
                </span>

              </div>

              <div>

                <strong>
                  2,500+
                </strong>

                <span>
                  Students
                </span>

              </div>

              <div>

                <strong>
                  95%
                </strong>

                <span>
                  Completion
                </span>

              </div>

              <div>

                <strong>
                  24/7
                </strong>

                <span>
                  Support
                </span>

              </div>

            </div>

          </div>

        </aside>

      </section>
            {/* ======================================= */}
      {/* STUDENT REVIEWS */}
      {/* ======================================= */}

      <section className="reviews-section">

        <div className="section-header">

          <span className="section-label">
            STUDENT REVIEWS
          </span>

          <h2>
            What our students are saying
          </h2>

        </div>

        <div className="testimonial-grid">

          <div className="testimonial-card">

            <div className="stars">
              ⭐⭐⭐⭐⭐
            </div>

            <p>
              "This course transformed my confidence in
              public speaking. Every lesson was engaging
              and practical."
            </p>

            <strong>
              — Michael R.
            </strong>

          </div>

          <div className="testimonial-card">

            <div className="stars">
              ⭐⭐⭐⭐⭐
            </div>

            <p>
              "The instructors explained every concept
              clearly and gave useful feedback during
              live sessions."
            </p>

            <strong>
              — Sophia L.
            </strong>

          </div>

          <div className="testimonial-card">

            <div className="stars">
              ⭐⭐⭐⭐⭐
            </div>

            <p>
              "Highly recommended for anyone preparing
              for debate tournaments."
            </p>

            <strong>
              — Daniel T.
            </strong>

          </div>

        </div>

      </section>

      {/* ======================================= */}
      {/* RELATED COURSES */}
      {/* ======================================= */}

      {relatedCourses.length > 0 && (

        <section className="related-section">

          <div className="section-header">

            <span className="section-label">
              YOU MAY ALSO LIKE
            </span>

            <h2>
              Related Courses
            </h2>

          </div>

          <div className="featured-grid">

            {relatedCourses.map((item) => (

              <article
                key={item.id}
                className="course-card"
              >

                <div className="course-content">

                  <span className="course-category">
                    {item.category}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                  <div className="course-meta">

                    <span>
                      👨‍🏫 {item.instructor}
                    </span>

                    <span>
                      PHP {item.price}
                    </span>

                  </div>

                  <Link
                    to={`/course/${item.id}`}
                    className="hero-primary-btn"
                  >
                    View Course
                  </Link>

                </div>

              </article>

            ))}

          </div>

        </section>

      )}

      {/* ======================================= */}
      {/* CTA */}
      {/* ======================================= */}

      <section className="cta-section">

        <div className="cta-card">

          <span className="section-label">
            START TODAY
          </span>

          <h2>
            Ready to begin your learning journey?
          </h2>

          <p>
            Join hundreds of students developing
            confidence, communication skills,
            and competitive debate experience.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-primary-btn"
              onClick={() => {
                onAddToCart(course);
                navigate('/checkout');
              }}
            >
              Enroll Now
            </button>

            <Link
              to="/classes"
              className="hero-secondary-btn"
            >
              Browse More Courses
            </Link>

          </div>

        </div>

      </section>

      {/* ======================================= */}
      {/* FOOTER */}
      {/* ======================================= */}

      <footer className="landing-footer">

        <div className="footer-grid">

          <div>

            <h3>
              PayPay Academy
            </h3>

            <p>
              Helping students develop critical
              thinking, confidence, leadership,
              and communication through
              high-quality online education.
            </p>

          </div>

          <div>

            <h4>
              Quick Links
            </h4>

            <ul>

              <li>
                <Link to="/">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/classes">
                  Courses
                </Link>
              </li>

              <li>
                <Link to="/checkout">
                  Checkout
                </Link>
              </li>

            </ul>

          </div>

          <div>

            <h4>
              Contact
            </h4>

            <ul>

              <li>
                support@paypayacademy.com
              </li>

              <li>
                +63 900 000 0000
              </li>

              <li>
                Online Learning Platform
              </li>

            </ul>

          </div>

        </div>

        <div className="footer-bottom">

          © {new Date().getFullYear()} PayPay Academy.
          All rights reserved.

        </div>

      </footer>

    </main>

  );

}