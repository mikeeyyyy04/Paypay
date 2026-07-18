import { Link } from 'react-router-dom';

type PublicHomePageProps = {
  cartCount: number;
};

export function PublicHomePage({ cartCount }: PublicHomePageProps) {
  return (
    <section className="landing-page">
      <header className="landing-hero landing-anchor" id="home">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Paypay Classes</p>
          <h1>Enroll in focused online classes with simple bank-transfer checkout.</h1>
          <p>
            Browse the class catalog, reserve your seat, and complete payment through a guided checkout designed for students and families.
          </p>
          <div className="landing-actions">
            <Link className="landing-button landing-button-primary" to="/classes">
              Browse classes
            </Link>
            <Link className="landing-button landing-button-secondary" to="/checkout">
              View checkout ({cartCount})
            </Link>
          </div>
        </div>

        <div className="landing-hero-panel" aria-label="Enrollment summary">
          <div>
            <span>Available catalog</span>
            <strong>6 classes</strong>
          </div>
          <div>
            <span>Checkout method</span>
            <strong>Bank transfer</strong>
          </div>
          <div>
            <span>Cart items</span>
            <strong>{cartCount}</strong>
          </div>
        </div>
      </header>

      <section className="landing-section landing-anchor" id="about">
        <div className="landing-section-header">
          <p className="landing-eyebrow">About Paypay</p>
          <h2>A clean enrollment flow from catalog to payment.</h2>
          <p>
            Paypay helps students browse focused online classes, reserve seats, and complete guided bank-transfer checkout without a messy back-and-forth.
          </p>
        </div>

        <div className="landing-grid">
          <article className="landing-card">
            <span>01</span>
            <h3>Choose a class</h3>
            <p>Compare topics, instructors, schedules, and pricing before adding classes to your cart.</p>
          </article>
          <article className="landing-card">
            <span>02</span>
            <h3>Review checkout</h3>
            <p>Confirm your selected classes and enter the student contact details needed for enrollment.</p>
          </article>
          <article className="landing-card">
            <span>03</span>
            <h3>Complete payment</h3>
            <p>Use the bank-transfer details generated during checkout and wait for admin verification.</p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-anchor" id="classes">
        <div className="landing-section-header">
          <p className="landing-eyebrow">Classes</p>
          <h2>Browse practical classes built for focused learning.</h2>
          <p>Explore schedules, instructors, available seats, and class details before adding anything to checkout.</p>
        </div>

        <div className="landing-grid">
          <article className="landing-card">
            <span>Live</span>
            <h3>Guided sessions</h3>
            <p>Structured classes with clear topics, capacity limits, and student-ready schedules.</p>
          </article>
          <article className="landing-card">
            <span>Cart</span>
            <h3>Easy reservation</h3>
            <p>Add the right class to your cart once, then review all enrollment details before payment.</p>
          </article>
          <article className="landing-card">
            <span>Admin</span>
            <h3>Verified enrollment</h3>
            <p>Admins can review transfer status so students know when their seats are confirmed.</p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-anchor" id="pricing">
        <div className="landing-section-header">
          <p className="landing-eyebrow">Pricing</p>
          <h2>Transparent class pricing before checkout.</h2>
          <p>Each class shows its current price in the catalog, so students can compare options before reserving a seat.</p>
        </div>
      </section>

      <section className="landing-band landing-anchor" id="contact">
        <div>
          <p className="landing-eyebrow">Contact</p>
          <h2>Find the right class and reserve your seat today.</h2>
        </div>
        <Link className="landing-button landing-button-primary" to="/classes">
          Open catalog
        </Link>
      </section>
    </section>
  );
}
