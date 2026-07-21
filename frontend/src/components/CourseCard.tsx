import { Link } from 'react-router-dom';
import type { PublicClass } from '../types';

type CourseCardProps = {
  course: PublicClass;
};

export function CourseCard({ course }: CourseCardProps) {
  const lowestPrice = course.pricingOptions?.reduce((minimum, option) => Math.min(minimum, option.amount), course.price) ?? course.price;

  return (
    <article className="public-course-card">
      <Link to={`/course/${course.slug}`} className="public-course-link">
        <div className="public-course-image-shell">
          <img src={course.coverImage ?? ''} alt={course.title} className="public-course-image" />
          <span className="public-course-badge">{course.category.toUpperCase()}</span>
        </div>

        <div className="course-card-copy">
          <h2>{course.title.toUpperCase()}</h2>
          <p className="course-card-brief">from USD {lowestPrice.toFixed(2)}</p>
        </div>
      </Link>
    </article>
  );
}

