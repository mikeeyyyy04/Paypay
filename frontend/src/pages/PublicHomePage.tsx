import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicClass } from '../types';
import coachHero from "../assets/coach.png";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

type PublicHomePageProps = {
  cartCount: number;
 
};





export function PublicHomePage({
  cartCount,
}: PublicHomePageProps) {
  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');

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
          setClassesError(
            error instanceof Error
              ? error.message
              : 'Failed to load classes.',
          );
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
  useEffect(() => {
  AOS.init({
    duration: 1000,
    once: true,
    easing: "ease-in-out",
  });
}, []);

  return (
    <main className="landing-page">

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

<section className="hero-section landing-anchor" id="home">

  <motion.div
    className="hero-left"
    initial={{ opacity: 0, x: -80 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
>
  

    <span className="hero-badge">
      🎓 Trusted by Students Worldwide
    </span>

    <h1>
      Learn.
      <br />
      Debate.
      <br />
      Win.
    </h1>

    <p>
      Master debate, public speaking, and critical thinking through
      world-class online courses designed by experienced coaches.
    </p>

    <div className="hero-buttons">

      <Link
        to="/classes"
        className="hero-primary-btn"
      >
        Explore Courses
      </Link>

      <Link
        to="/checkout"
        className="hero-secondary-btn"
      >
        Cart ({cartCount})
      </Link>

    </div>

    <div className="hero-rating">
      ⭐⭐⭐⭐⭐ Rated 4.9/5 by over 2,000+ students
    </div>

  </motion.div>

<motion.div
    className="hero-right"
    initial={{ opacity: 0, x: 80 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
        duration: 1,
        delay: .3
    }}
>

    <img
        src={coachHero}
        alt="Debate Coach"
        className="hero-coach-image"
    />

</motion.div>

</section>


</main>
  );
}