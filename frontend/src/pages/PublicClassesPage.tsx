import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Griffith from "../assets/Griffith.jpg";

type PublicClassesPageProps = {
  cartCount: number;
};

export function PublicClassesPage({
  cartCount,
}: PublicClassesPageProps) {

  return (
    <main className="courses-page">

      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

      <section className="courses-hero">

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >

          <h1>COURSES</h1>

          <p>
            Learn from nationally recognized debate coaches through
            structured classes designed to help students compete at the
            highest level.
          </p>

          <Link
            to="/checkout"
            className="courses-checkout-btn"
          >
            Checkout ({cartCount})
          </Link>

        </motion.div>

      </section>

      {/* ====================================================== */}
      {/* ADVANCED LINCOLN DOUGLAS */}
      {/* ====================================================== */}

      <motion.section
        className="course-section"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
      >

        <h2>
          ADVANCED LINCOLN DOUGLAS
        </h2>

        <div className="course-content">

          <div className="course-block">

            <h3>What</h3>

            <p>
              This class is for students looking to win at the highest
              level. This class will focus on becoming a top Lincoln
              Douglas debater by improving case writing, applications,
              evidence usage, cross-examination, voting issues, and the
              acquisition of knowledge while following current
              resolutions.
            </p>

            <p className="course-note">
              <strong>NOTE:</strong> Even if you cannot make the class
              time, recordings will be available to all class attendees.
            </p>

          </div>

          <div className="course-details">

            <div className="detail-card">

              <h4>Who</h4>

              <p>
                Griffith Vertican
              </p>

            </div>

            <div className="detail-card">

              <h4>When</h4>

              <p>
                Tuesdays
                <br />
                10:30 AM – 11:30 AM
                <br />
                Pacific Time
              </p>

            </div>

          </div>

          <div className="pricing-grid">

            <div className="price-box">
              <span>Quarter</span>
              <strong>$199</strong>
            </div>

            <div className="price-box">
              <span>Semester</span>
              <strong>$299</strong>
            </div>

            <div className="price-box">
              <span>Full Year</span>
              <strong>$599</strong>
            </div>

          </div>

          <Link
            to="/checkout"
            className="register-button"
          >
            REGISTER NOW
          </Link>

        </div>

      </motion.section>

      {/* ====================================================== */}
      {/* ULTIMATE LINCOLN DOUGLAS */}
      {/* ====================================================== */}

      <motion.section
        className="course-section"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
      >

        <h2>
          ULTIMATE LINCOLN DOUGLAS
        </h2>

        <div className="course-content">

          <div className="course-block">

            <h3>What</h3>

            <p>
              This class is for students looking to win at the highest
              level. Students will improve case writing, applications,
              evidence usage, cross-examination, and voting issues. The
              class contains similar content to Advanced Lincoln
              Douglas and is designed for serious competitors.
            </p>

            <p className="course-note">
              <strong>NOTE:</strong> Even if you cannot make the class
              time, recordings will be available to all class attendees.
            </p>

          </div>

          <div className="course-details">

            <div className="detail-card">

              <h4>Who</h4>

              <p>
                Griffith Vertican
              </p>

            </div>

            <div className="detail-card">

              <h4>When</h4>

              <p>
                Mondays
                <br />
                5:00 PM – 6:00 PM
                <br />
                Pacific Time
              </p>

            </div>

          </div>

          <div className="pricing-grid">

            <div className="price-box">
              <span>Quarter</span>
              <strong>$199</strong>
            </div>

            <div className="price-box">
              <span>Semester</span>
              <strong>$299</strong>
            </div>

            <div className="price-box">
              <span>Full Year</span>
              <strong>$599</strong>
            </div>

          </div>

          <Link
            to="/checkout"
            className="register-button"
          >
            REGISTER NOW
          </Link>

        </div>

      </motion.section>

 
      {/* ====================================================== */}
      {/* ADVANCED TEAM POLICY */}
      {/* ====================================================== */}

      <motion.section
        className="course-section"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
      >

        <h2>
          ADVANCED TEAM POLICY
        </h2>

        <div className="course-content">

          <div className="course-block">

            <h3>What</h3>

            <p>
              This year's class focuses heavily on evidence, including
              cutting better evidence, gathering more evidence, and
              learning effective ways to attack opposing evidence.
              Students will also study top cases, common tournament
              arguments, negative strategies, and cross-examination
              techniques while preparing for the new healthcare policy
              resolution.
            </p>

            <p className="course-note">
              <strong>NOTE:</strong> Even if you cannot attend the class
              live, recordings will be available for every enrolled
              student.
            </p>

          </div>

          <div className="course-details">

            <div className="detail-card">

              <h4>Who</h4>

              <p>Griffith Vertican</p>

            </div>

            <div className="detail-card">

              <h4>When</h4>

              <p>
                Mondays
                <br />
                3:30 PM – 4:30 PM
                <br />
                Pacific Time
              </p>

            </div>

          </div>

          <div className="pricing-grid">

            <div className="price-box">
              <span>Quarter</span>
              <strong>$199</strong>
            </div>

            <div className="price-box">
              <span>Semester</span>
              <strong>$299</strong>
            </div>

            <div className="price-box">
              <span>Full Year</span>
              <strong>$599</strong>
            </div>

          </div>

          <Link
            to="/checkout"
            className="register-button"
          >
            REGISTER NOW
          </Link>

        </div>

      </motion.section>

      {/* ====================================================== */}
      {/* DEBATE 101 */}
      {/* ====================================================== */}

      <motion.section
        className="course-section"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
      >

        <h2>
          DEBATE 101:
          <br />
          INTRO TO COMPETITIVE AND
          ACADEMIC DEBATE
        </h2>

        <div className="course-content">

          <div className="course-block">

            <h3>What</h3>

            <p>
              This introductory class is designed for students who are
              completely new to Lincoln Douglas and Team Policy Debate.
              Students will learn the fundamentals of debate, argument
              structure, speaking techniques, and competitive strategy
              from experienced national-level coaches.
            </p>

            <p className="course-note">
              <strong>NOTE:</strong> Class recordings are available for
              all enrolled students who cannot attend the live session.
            </p>

          </div>

          <div className="course-details">

            <div className="detail-card">

              <h4>Who</h4>

              <p>Griffith Vertican</p>

            </div>

            <div className="detail-card">

              <h4>When</h4>

              <p>
                Thursdays
                <br />
                12:30 PM – 1:30 PM
                <br />
                Pacific Time
              </p>

            </div>

          </div>

          <div className="pricing-grid">

            <div className="price-box">
              <span>Semester</span>
              <strong>$299</strong>
            </div>

            <div className="price-box">
              <span>Full Year</span>
              <strong>$599</strong>
            </div>

          </div>

          <Link
            to="/checkout"
            className="register-button"
          >
            REGISTER NOW
          </Link>

        </div>

      </motion.section>

            {/* ====================================================== */}
      {/* SPEECH WITH GRIFFITH VERTICAN */}
      {/* ====================================================== */}

      <motion.section
        className="course-section"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
      >

        <h2>
          SPEECH WITH GRIFFITH VERTICAN
        </h2>

        <div className="course-content">

          <div className="course-block">

            <h3>What</h3>

            <p>
              Taught by Extemporaneous Champion Griffith Vertican, this
              class focuses on Limited Preparation events including
              Extemporaneous, Apologetics, Mars Hill, and Impromptu.
              Students will also receive instruction in Platform events
              such as Original Oratory, Persuasive, and Expository, with
              guest appearances from Charis Baker and Nathan Thomas for
              Interpretation events.
            </p>

            <p className="course-note">
              <strong>NOTE:</strong> Recordings are available for all
              enrolled students.
            </p>

          </div>

          <div className="course-details">

            <div className="detail-card">
              <h4>Who</h4>
              <p>Griffith Vertican</p>
            </div>

            <div className="detail-card">
              <h4>When</h4>
              <p>
                Fridays
                <br />
                12:30 PM – 1:30 PM
                <br />
                Pacific Time
              </p>
            </div>

          </div>

          <div className="pricing-grid">

            <div className="price-box">
              <span>Quarter</span>
              <strong>$199</strong>
            </div>

            <div className="price-box">
              <span>Semester</span>
              <strong>$299</strong>
            </div>

            <div className="price-box">
              <span>Full Year</span>
              <strong>$599</strong>
            </div>

          </div>

          <Link
            to="/checkout"
            className="register-button"
          >
            REGISTER NOW
          </Link>

        </div>

      </motion.section>

      {/* ====================================================== */}
      {/* PARLI PROTOCOL */}
      {/* ====================================================== */}

      <motion.section
        className="course-section"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
      >

        <h2>
          PARLI PROTOCOL
        </h2>

        <div className="course-content">

          <div className="course-block">

            <h3>What</h3>

            <p>
              Once each month, Coach Griffith teaches Parliamentary
              Debate including case construction for fact, value, and
              policy resolutions, research during preparation time,
              handling motions, and effective opposition strategy.
              Students will also analyze rounds, current resolutions,
              and real-world arguments.
            </p>

            <p className="course-note">
              <strong>NOTE:</strong> Recordings are available for all
              enrolled students.
            </p>

          </div>

          <div className="course-details">

            <div className="detail-card">
              <h4>Who</h4>
              <p>Griffith Vertican</p>
            </div>

            <div className="detail-card">
              <h4>When</h4>
              <p>
                2nd Friday of every month
                <br />
                2:00 PM – 3:30 PM
                <br />
                Pacific Time
              </p>
            </div>

          </div>

          <div className="pricing-grid">

            <div className="price-box">
              <span>Semester</span>
              <strong>$99</strong>
            </div>

          </div>

          <Link
            to="/checkout"
            className="register-button"
          >
            REGISTER NOW
          </Link>

        </div>

      </motion.section>

      {/* ====================================================== */}
      {/* REGISTER */}
      {/* ====================================================== */}

      <section className="register-section">

        <h2>
          READY TO START?
        </h2>

        <p>
          Join one of our nationally recognized debate classes and begin
          developing the skills needed to compete with confidence.
        </p>

        <Link
          to="/checkout"
          className="register-big-button"
        >
          REGISTER HERE
        </Link>

      </section>

      {/* ====================================================== */}
      {/* ABOUT GRIFFITH */}
      {/* ====================================================== */}

      <section className="coach-section">

        <div className="coach-image">

          <img
    src={Griffith}
    alt="Griffith Vertican"
/>

        </div>

        <div className="coach-info">

          <h2>
            ABOUT GRIFFITH VERTICAN
          </h2>

          <p>
            Griffith is a licensed Attorney, the 2007 NPDA National
            Champion, and one of the most successful coaches in Stoa,
            with more than 15 years of coaching experience.
          </p>

          <p>
            He serves on the Stoa Debate Committee and has coached
            multiple national champions across all three debate formats.
            His students include the 2018, 2019, 2021, 2022, and 2024
            Lincoln Douglas National Champions.
          </p>

        </div>

      </section>
         </main>
  );
}