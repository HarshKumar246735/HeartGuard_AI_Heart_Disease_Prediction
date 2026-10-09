import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminNav, userNav } from '../utils/constants';
import '../css/dashboard.css';

function NavGroup({ title, items, onNavigate }) {
  return (
    <div className="nav-group">
      {title && <p className="nav-title">{title}</p>}
      <ul>
        {items.map((n) => (
          <li key={n.to}>
            <NavLink to={n.to} end={n.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
              <Icon name={n.icon} size={19} />
              <span>{n.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary">
        <div className="sidebar-head">
          <Logo to={isAdmin ? '/admin' : '/dashboard'} light />
          <button className="btn btn-ghost btn-icon sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          <NavGroup items={userNav} onNavigate={() => setOpen(false)} title={isAdmin ? 'Personal' : null} />
          {isAdmin && <NavGroup title="Administration" items={adminNav} onNavigate={() => setOpen(false)} />}
        </nav>
        <div className="sidebar-foot">
          <p>Educational estimate only. Not a medical diagnosis.</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Menu size={22} /></button>
          <div className="topbar-spacer" />
          <div className="topbar-user">
            <span className="avatar" aria-hidden="true">{initials}</span>
            <div className="topbar-user-text">
              <strong>{user.name}</strong>
              <small>{isAdmin ? 'Administrator' : 'Member'}</small>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={16} aria-hidden="true" /> <span className="hide-sm">Log out</span></button>
        </header>
        <main id="main" className="app-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
