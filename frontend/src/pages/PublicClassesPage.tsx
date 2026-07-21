import { useEffect, useMemo, useState } from 'react';
import { publicApi } from '../api';
import type { PublicClass } from '../types';
import { publicCourses } from '../data/initialData';
import { CourseCard } from '../components/CourseCard';
import defaultCourse from '../assets/courses/img1.jpg';

export function PublicClassesPage() {
  const [courses, setCourses] = useState<PublicClass[]>(publicCourses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        const response = await publicApi.listClasses();

        if (mounted && response?.classes?.length) {
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
      <header className="courses-page-hero">
        <div className="courses-hero-copy">
          <span className="page-tag">ALL</span>
          <h1>CLASSES</h1>
          <p>
            Master debate, public speaking, and critical thinking through world-class training.
          </p>
        </div>

        <nav className="courses-category-bar" aria-label="Course categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`courses-category-chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      </header>

      <section className="courses-grid" aria-label="Available classes">
        {loading ? <p className="catalog-message">Loading courses...</p> : null}
        {!loading && error ? <p className="catalog-message error">{error}</p> : null}
        {!loading && !error && filteredCourses.length === 0 ? (
          <p className="catalog-message">No classes available yet.</p>
        ) : null}

        {!loading && !error
          ? filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          : null}
      </section>

    </main>
  );
}
