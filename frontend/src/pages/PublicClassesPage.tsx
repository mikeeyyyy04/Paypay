import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicClass } from '../types';

type PublicClassesPageProps = {
  cartCount: number;
  onAddToCart: (classItem: PublicClass) => void;
};

export function PublicClassesPage({ cartCount, onAddToCart }: PublicClassesPageProps) {
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
          <h2>Browse classes</h2>
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

      <div className="store-class-grid">
        {classes.map((classItem) => (
          <article key={classItem.id} className="store-class-card">
            <div className="store-card-topline">
              <span>{classItem.category}</span>
              <strong>${classItem.price.toFixed(2)}</strong>
            </div>
            <h3>{classItem.title}</h3>
            <p>{classItem.description}</p>
            <dl>
              <div>
                <dt>Instructor</dt>
                <dd>{classItem.instructor}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>{classItem.schedule}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>
                  {classItem.enrolled}/{classItem.capacity}
                </dd>
              </div>
            </dl>
            <button className="button small-button" type="button" onClick={() => onAddToCart(classItem)}>
              Add to cart
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
