import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, BarChart2, Home, Menu, X } from 'lucide-react';

const links = [
  { to: '/',          label: 'Accueil',    icon: Home      },
  { to: '/quizzes',   label: 'Quiz',       icon: BookOpen  },
  { to: '/dashboard', label: 'Dashboard',  icon: BarChart2 },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(8,13,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316, #fbbf24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'white',
          }}>A</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem' }}>
            Afri<span className="text-gradient">Sio</span> CI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hide-mobile">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 99,
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.9rem',
                transition: 'all 0.2s',
                background: pathname === to ? 'rgba(249,115,22,0.15)' : 'transparent',
                color: pathname === to ? 'var(--color-primary)' : 'var(--color-muted)',
                border: pathname === to ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/quizzes" className="btn-primary hide-mobile" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
            Commencer
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="show-mobile"
            onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: 4 }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="glass" style={{ margin: '0 16px 12px', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10,
                fontFamily: 'var(--font-display)', fontWeight: 500,
                color: pathname === to ? 'var(--color-primary)' : 'var(--color-text)',
                background: pathname === to ? 'rgba(249,115,22,0.1)' : 'transparent',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .hide-mobile { display: none !important; } }
        @media (min-width: 641px) { .show-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
