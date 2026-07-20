import { Link } from 'react-router-dom';

type CourseCardProps = {
  slug: string;
  title: string;
  image: string;
  instructor: string;
  category: string;
  price: number;
  description: string;
};

export function CourseCard({
  slug,
  title,
  image,
  instructor,
  category,
  price,
  description,
}: CourseCardProps) {
  return (
    <article className="course-card">
      <Link to={`/course/${slug}`} className="course-card-link">
        <div className="course-image-wrapper">
          <img src={image} alt={title} className="course-card-image" />
        </div>
        <div className="course-card-copy">
          <div className="course-card-topline">
            <span>{category}</span>
            <strong>PHP {price.toFixed(2)}</strong>
          </div>
          <h3>{title}</h3>
          <p className="course-card-instructor">{instructor}</p>
          <p className="course-card-description">{description}</p>
          <span className="course-arrow">View Course {'->'}</span>
        </div>
      </Link>
    </article>
  );
}

