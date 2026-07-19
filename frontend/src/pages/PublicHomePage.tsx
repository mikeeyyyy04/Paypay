import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicClass } from '../types';

type PublicHomePageProps = {
  cartCount: number;
  onAddToCart: (classItem: PublicClass) => void;
};

type Artwork = {
  eyebrow: string;
  lines: string[];
};

const artworkByTitle: Record<string, Artwork> = {
  'Advanced Lincoln Douglas Debate Class': {
    eyebrow: 'Lincoln Douglas',
    lines: ['Debate', 'Class'],
  },
  'Advanced Team Policy Debate Class': {
    eyebrow: 'Team Policy',
    lines: ['Debate', 'Class'],
  },
  'Parli Protocol': {
    eyebrow: 'Monthly',
    lines: ['Parli', 'Protocol'],
  },
  'Debate Intro Class': {
    eyebrow: 'Debate',
    lines: ['Intro', 'Class'],
  },
  'NIHD Speech Class': {
    eyebrow: 'NIHD',
    lines: ['Speech', 'Class'],
  },
  'Ultimate LD Debate Class': {
    eyebrow: 'Ultimate LD',
    lines: ['Debate', 'Class'],
  },
};

export function PublicHomePage({ cartCount, onAddToCart }: PublicHomePageProps) {
  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [selectedClass, setSelectedClass] = useState<PublicClass | null>(null);
  const [studentFirst, setStudentFirst] = useState('');
  const [studentLast, setStudentLast] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadClasses() {
      try {
        const response = await publicApi.listClasses();
        if (mounted) {
          setClasses(response.classes.slice(0, 6));
        }
      } catch (error) {
        if (mounted) {
          setClassesError(error instanceof Error ? error.message : 'Failed to load classes.');
        }
      } finally {
        if (mounted) {
          setLoadingClasses(false);
        }
      }
    }

    loadClasses();

    return () => {
      mounted = false;
    };
  }, []);

  function openRegistration(classItem: PublicClass) {
    setSelectedClass(classItem);
    setRegistrationMessage('');
  }

  function closeRegistration() {
    setSelectedClass(null);
    setStudentFirst('');
    setStudentLast('');
    setStudentEmail('');
    setStudentPhone('');
  }

  function submitRegistration(event: FormEvent) {
    event.preventDefault();

    if (!selectedClass) {
      return;
    }

    onAddToCart(selectedClass);
    setRegistrationMessage(`${selectedClass.title} was added to your cart.`);
    closeRegistration();
  }

  return (
    <section className="landing-page">
      <header className="landing-hero landing-anchor" id="home">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Paypay Classes</p>
          <h1>Enroll in focused online classes with simple manual payment.</h1>
          <p>
            Browse the class catalog, reserve your seat, and pay through GCash or bank transfer for admin verification.
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
            <strong>Manual payment</strong>
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
            Paypay helps students browse focused online classes, reserve seats, and complete guided manual payment without a messy back-and-forth.
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
            <p>Pay through GCash or bank transfer and wait for admin payment confirmation.</p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-anchor" id="classes">
        <div className="landing-section-header">
          <p className="landing-eyebrow">Classes</p>
          <h2>Browse practical classes built for focused learning.</h2>
          <p>Explore schedules, instructors, available seats, and class details before adding anything to checkout.</p>
        </div>

        {loadingClasses ? <p className="muted">Loading classes...</p> : null}
        {classesError ? <p className="error">{classesError}</p> : null}

        {registrationMessage ? <p className="landing-success">{registrationMessage}</p> : null}

        <div className="landing-class-grid">
          {classes.map((classItem, index) => {
            const artwork = artworkByTitle[classItem.title] ?? {
              eyebrow: classItem.category,
              lines: classItem.title.split(' ').slice(-2),
            };

            return (
              <button
                className="landing-class-card class-product"
                key={classItem.id}
                type="button"
                onClick={() => openRegistration(classItem)}
              >
                <div className={`class-art class-art-${(index % 6) + 1}`} aria-hidden="true">
                  <div className="class-art-copy">
                    <span>{artwork.eyebrow}</span>
                    {artwork.lines.map((line) => (
                      <strong key={line}>{line}</strong>
                    ))}
                  </div>
                </div>
                <h3>{classItem.title}</h3>
                <p>
                  <span>from PHP {classItem.price.toFixed(2)}</span>
                  <strong>Register</strong>
                </p>
              </button>
            );
          })}
        </div>

        <div className="landing-class-actions">
          <Link className="landing-button landing-button-secondary" to="/classes">
            View all classes
          </Link>
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

      {selectedClass ? (
        <div className="registration-modal-backdrop" role="presentation">
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <div className="registration-modal-header">
              <div>
                <p className="landing-eyebrow">Class</p>
                <h2 id="registration-title">{selectedClass.title}</h2>
              </div>
              <button className="registration-close" type="button" aria-label="Close" onClick={closeRegistration}>
                ×
              </button>
            </div>

            <form className="registration-form" onSubmit={submitRegistration}>
              <label>
                Student First <span>(required)</span>
                <input value={studentFirst} onChange={(event) => setStudentFirst(event.target.value)} required />
              </label>
              <label>
                Student Last <span>(required)</span>
                <input value={studentLast} onChange={(event) => setStudentLast(event.target.value)} required />
              </label>
              <label>
                Student Email <span>(required)</span>
                <input
                  value={studentEmail}
                  onChange={(event) => setStudentEmail(event.target.value)}
                  type="email"
                  required
                />
              </label>
              <label>
                Student Phone
                <input value={studentPhone} onChange={(event) => setStudentPhone(event.target.value)} type="tel" />
              </label>

              <p className="registration-note">
                Your registration will not be received until you have gone to the cart in the top right hand corner of
                the screen and submitted payment. Please do so at your earliest convenience so as to save your spot.
              </p>

              <button className="registration-submit" type="submit">
                Register
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
