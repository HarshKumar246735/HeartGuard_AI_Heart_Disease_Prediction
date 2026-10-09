import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#features', label: 'Features' },
  { href: '/#about', label: 'About' },
];

export default function PublicNavbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dash = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : null;

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Logo />
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
          <div className="nav-cta">
            {dash ? (
              <Link to={dash} className="btn btn-primary" onClick={() => setOpen(false)}>Open dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </nav>
        <button className="btn btn-ghost btn-icon nav-toggle" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
