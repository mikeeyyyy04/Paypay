import { useEffect, useMemo, useState } from 'react';
import { publicApi } from '../api';
import type { PublicClass } from '../types';
import { CourseCard } from '../components/CourseCard';
import defaultCourse from '../assets/courses/img1.jpg';

export function PublicClassesPage() {
  const [courses, setCourses] = useState<PublicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        const response = await publicApi.listClasses();

        if (mounted) {
          setCourses(response.classes);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load courses.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(
    () => ['ALL', ...new Set(courses.map((course) => course.category))],
    [courses],
  );

  const filteredCourses = useMemo(
    () => courses.filter((course) => selectedCategory === 'ALL' || course.category === selectedCategory),
    [courses, selectedCategory],
  );

  return (
    <main className="courses-page">
      <section className="courses-hero">
        <div className="courses-hero-content">
          <span className="courses-badge">PROFESSIONAL DEBATE TRAINING</span>
          <h1>OUR COURSES</h1>
          <p>
            Learn from nationally recognized debate coaches through structured online programs designed to help students compete with confidence.
          </p>
        </div>
      </section>

      <nav className="courses-filter" aria-label="Course catalog filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="courses-grid" aria-label="Available debate courses">
        {loading ? <p className="catalog-message">Loading courses...</p> : null}
        {!loading && error ? <p className="catalog-message error">{error}</p> : null}
        {!loading && !error && filteredCourses.length === 0 ? (
          <p className="catalog-message">No courses available in this category.</p>
        ) : null}

        {!loading && !error
          ? filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                image={course.coverImage ?? defaultCourse}
                instructor={course.instructor}
                category={course.category}
                price={course.price}
                description={course.description}
              />
            ))
          : null}
      </section>
    </main>
  );
}
