import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicClass } from '../types';
import defaultCourse from '../assets/courses/img1.jpg';

type CourseDetailsPageProps = {
  cartCount: number;
  onAddToCart: (classItem: PublicClass) => void;
};

export function CourseDetailsPage({
  cartCount: _cartCount,
  onAddToCart,
}: CourseDetailsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<PublicClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      if (!id) {
        setError('Course not found.');
        setLoading(false);
        return;
      }

      try {
        const response = await publicApi.getClass(id);

        if (mounted) {
          setCourse(response.classItem);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Course not found.');
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

    onAddToCart(course);
    navigate('/checkout');
  }

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
            <Link to="/classes">Classes</Link>
            <span>&gt;</span>
            <span>{course.title}</span>
          </div>
        </div>

        <section className="product-course-layout" aria-label={`${course.title} details`}>
          <div className="product-course-media">
            <img src={course.coverImage ?? defaultCourse} alt={course.title} />
          </div>

          <div className="product-course-copy">
            <p className="product-course-category">{course.category}</p>
            <h1>{course.title}</h1>
            <p className="product-course-price">PHP {course.price.toFixed(2)}</p>
            <p className="product-course-schedule">{course.schedule}</p>

            <div className="product-course-body">
              <p>{course.description}</p>
              <dl className="product-course-facts">
                <div>
                  <dt>Instructor</dt>
                  <dd>{course.instructor}</dd>
                </div>
                <div>
                  <dt>Capacity</dt>
                  <dd>{course.enrolled}/{course.capacity} enrolled</dd>
                </div>
              </dl>
            </div>

            <form className="product-course-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>QUANTITY:</span>
                <input
                  min="1"
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                />
              </label>

              <button type="button" onClick={handleRegister}>REGISTER</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
