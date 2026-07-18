import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="storefront-page">
      <article className="storefront-panel">
        <p className="eyebrow">Route not found</p>
        <h2>This page does not exist.</h2>
        <p className="muted">Go back to the public classes page or open the admin login.</p>
        <div className="storefront-actions">
          <Link className="button small-button" to="/classes">
            Browse classes
          </Link>
          <Link className="button button-secondary small-button" to="/login">
            Admin login
          </Link>
        </div>
      </article>
    </section>
  );
}