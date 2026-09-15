import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'Book Now', to: '/booking' },
];

export default function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Detect scroll to apply glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold-600 flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform">
              <span className="text-white font-serif font-bold text-sm md:text-base">P</span>
            </div>
            <div className="leading-tight">
              <div className={`font-serif font-semibold text-base md:text-lg transition-colors ${
                isTransparent ? 'text-white' : 'text-charcoal'
              }`}>
                Purity Events
              </div>
              <div className={`font-sans text-[10px] tracking-[0.15em] uppercase transition-colors ${
                isTransparent ? 'text-cream-300' : 'text-gold-600'
              }`}>
                &amp; Decorations
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 font-sans text-sm font-medium tracking-wide transition-colors rounded-sm ${
                    link.to === '/booking'
                      ? 'ml-2 btn-gold text-xs py-2 px-6'
                      : isActive
                        ? isTransparent ? 'text-gold-300' : 'text-gold-600'
                        : isTransparent
                          ? 'text-white/90 hover:text-white'
                          : 'text-gray-600 hover:text-gold-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── User Actions ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 group"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-gold-400 group-hover:border-gold-600 transition-colors"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gold-600 flex items-center justify-center border-2 border-gold-400">
                      <span className="text-white font-serif font-semibold text-sm">
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className={`font-sans text-sm font-medium transition-colors ${
                    isTransparent ? 'text-white' : 'text-charcoal'
                  }`}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronIcon className={`w-4 h-4 transition-transform ${
                    profileOpen ? 'rotate-180' : ''
                  } ${isTransparent ? 'text-white' : 'text-gray-500'}`} />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-sm shadow-card-hover border border-cream-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-cream-200">
                      <p className="font-serif text-sm font-semibold text-charcoal truncate">{user.name}</p>
                      <p className="font-sans text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm font-sans text-charcoal hover:bg-cream-100 hover:text-gold-600 transition-colors">
                      My Dashboard
                    </Link>
                    <Link to="/vision-board" className="block px-4 py-2 text-sm font-sans text-charcoal hover:bg-cream-100 hover:text-gold-600 transition-colors">
                      Vision Board
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm font-sans text-burgundy-700 hover:bg-burgundy-50 transition-colors font-semibold">
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-cream-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-sans text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`font-sans text-sm font-medium px-5 py-2 border rounded-sm transition-all ${
                  isTransparent
                    ? 'border-white/60 text-white hover:bg-white/10'
                    : 'border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white'
                }`}
              >
                Client Login
              </Link>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden p-2 rounded-sm focus:outline-none"
            onClick={() => setMobileOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 transition-all duration-300 ${
                isTransparent ? 'bg-white' : 'bg-charcoal'
              } ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 transition-all duration-300 ${
                isTransparent ? 'bg-white' : 'bg-charcoal'
              } ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 transition-all duration-300 ${
                isTransparent ? 'bg-white' : 'bg-charcoal'
              } ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      } bg-white border-t border-cream-200`}>
        <div className="section-container py-4 flex flex-col gap-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `block px-4 py-3 font-sans text-sm font-medium rounded-sm transition-colors ${
                  isActive ? 'bg-cream-100 text-gold-600' : 'text-charcoal hover:bg-cream-50 hover:text-gold-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <hr className="border-cream-200 my-2" />

          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gold-400" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold-600 flex items-center justify-center">
                    <span className="text-white font-serif text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="font-sans text-sm font-semibold text-charcoal">{user.name}</p>
                  <p className="font-sans text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <Link to="/dashboard" className="block px-4 py-3 font-sans text-sm text-charcoal hover:bg-cream-50 hover:text-gold-600 rounded-sm">My Dashboard</Link>
              <Link to="/vision-board" className="block px-4 py-3 font-sans text-sm text-charcoal hover:bg-cream-50 hover:text-gold-600 rounded-sm">Vision Board</Link>
              {isAdmin && (
                <Link to="/admin" className="block px-4 py-3 font-sans text-sm text-burgundy-700 font-semibold hover:bg-burgundy-50 rounded-sm">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 font-sans text-sm text-rose-600 hover:bg-rose-50 rounded-sm">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="mx-4 btn-gold text-center">
              Client Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
