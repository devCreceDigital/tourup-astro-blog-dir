import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Destinos', path: '/peru/' },
    { label: 'Tours', path: '/peru/cusco/tours/' },
    { label: 'Itinerarios', path: '/peru/itinerario-10-dias/' },
    { label: 'Blog', path: '/blog/' },
    { label: 'B2B', path: '/b2b/' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-border-color sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="#0f6e56" />
              <path d="M10 20c0-6 6-10 6-10s6 4 6 10-6 4-6 4-6-2-6-4z" fill="#e1f5ee" />
              <circle cx="16" cy="18" r="2" fill="#0f6e56" />
            </svg>
            <span className="text-[18px] font-bold text-primary">PeruTours</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[14px] font-medium transition-colors ${
                  isActive(link.path) ? 'text-primary' : 'text-text-secondary hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/peru/cusco/tours/" className="btn-primary text-[13px] px-4 py-2">
              Reservar ahora
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-border-color pt-4" aria-label="Mobile navigation">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[14px] font-medium ${
                    isActive(link.path) ? 'text-primary' : 'text-text-secondary'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/peru/cusco/tours/" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                Reservar ahora
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
