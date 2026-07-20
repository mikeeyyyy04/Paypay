import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  {
    label: "Home",
    sectionId: "home",
    path: "/",
  },
  {
    label: "About",
    sectionId: "about",
    path: "/#about",
  },
  {
    label: "Classes",
    path: "/classes",
  },
  {
    label: "Pricing",
    sectionId: "pricing",
    path: "/#pricing",
  },
  {
    label: "Contact",
    sectionId: "contact",
    path: "/#contact",
  },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      setIsMenuOpen(false);
      return;
    }

    const sectionElements = navItems
      .map((item) => document.getElementById(item.sectionId))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sectionElements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => secondEntry.intersectionRatio - firstEntry.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-32% 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) {
      return;
    }

    const sectionId = location.hash.slice(1);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    });
  }, [location.hash, location.pathname]);

  function scrollToSection(sectionId: string) {
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${sectionId}`);
    setActiveSection(sectionId);
  }

  return (
    <header className={`public-nav${hasScrolled ? ' public-nav-scrolled' : ''}`}>
      <Link className="public-brand" to="/" aria-label="Paypay home" onClick={() => setIsMenuOpen(false)}>
        <span className="public-brand-mark" aria-hidden="true">
          P
        </span>
        <span>Paypay</span>
      </Link>

      <button
        className="public-menu-toggle"
        type="button"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="public-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="public-navigation"
        className={`public-nav-panel${isMenuOpen ? ' public-nav-panel-open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="public-nav-links">
          {navItems.map((item) => (
  <button
    key={item.label}
    className={activeSection === item.sectionId ? "active" : ""}
    type="button"
    onClick={() => {
      setIsMenuOpen(false);

      if (item.path === "/classes") {
        navigate("/classes");
        return;
      }

      if (item.path === "/") {
        navigate("/");
        return;
      }

      if (item.sectionId) {
        scrollToSection(item.sectionId);
      }
    }}
  >
    {item.label}
  </button>
))}
        </div>

        <Link className="public-login-button" to="/admin/login" onClick={() => setIsMenuOpen(false)}>
          Login
        </Link>
      </nav>
    </header>
  );
}
