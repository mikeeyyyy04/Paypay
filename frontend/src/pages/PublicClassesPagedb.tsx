import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicClass } from '../types';

type PublicClassesPageProps = {
  cartCount: number;
};

export function PublicClassesPage({ cartCount,}: PublicClassesPageProps) {
  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadClasses() {
      try {
        const response = await publicApi.listClasses();
        if (mounted) {
          setClasses(response.classes);
        }
      } catch (apiError) {
        if (mounted) {
          setError(apiError instanceof Error ? apiError.message : 'Failed to load classes.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => [...new Set(classes.map((classItem) => classItem.category))], [classes]);

  return (
    <section className="storefront-page">
      <header className="storefront-header">
        <div>
          <p className="eyebrow">Public catalog</p>
          <h1>COURSES</h1>

<p>
Master debate, public speaking, and critical
thinking through world-class training.
</p>
          <p className="muted">Add classes to cart and proceed to checkout when you are ready.</p>
        </div>
        <Link className="button small-button" to="/checkout">
          Checkout ({cartCount})
        </Link>
      </header>

      {categories.length ? (
        <div className="chip-row" aria-label="Class categories">
          {categories.map((category) => (
            <span key={category} className="chip">
              {category}
            </span>
          ))}
        </div>
      ) : null}

      {loading ? <p className="muted">Loading classes...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="courses-grid">
        {classes.map((classItem) => (
          <article
    key={classItem.id}
    className="course-card"
>
<div className="course-category">
    {classItem.category}
</div>

<h2 className="course-title">
    {classItem.title}
</h2>

<p className="course-description">
    {classItem.description}
</p>

<div className="course-meta">

    <div>
        <strong>Instructor</strong>
        <p>{classItem.instructor}</p>
    </div>

    <div>
        <strong>Schedule</strong>
        <p>{classItem.schedule}</p>
    </div>

    <div>
        <strong>Capacity</strong>
        <p>{classItem.capacity} Students</p>
    </div>

</div>

<div className="course-footer">

    <span className="course-price">
        USD {classItem.price.toLocaleString()}
    </span>

    <Link
        to={`/course/${classItem.id}`}
        className="view-course-btn"
    >
        View Course →
    </Link>

</div>
          </article>
        ))}
      </div>
    </section>
  );
}
