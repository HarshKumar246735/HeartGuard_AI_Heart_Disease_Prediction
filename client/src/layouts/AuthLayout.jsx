import { Link } from 'react-router-dom';
import { HeartPulse, LockKeyhole, TrendingUp } from 'lucide-react';
import Logo from '../components/Logo';
import Disclaimer from '../components/Disclaimer';
import '../css/auth.css';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Logo light />
        <div className="auth-aside-body">
          <h2>Understand your heart risk. Make better health decisions.</h2>
          <ul>
            <li><HeartPulse size={20} aria-hidden="true" /><span>Enter a few health values and get an educational risk estimate.</span></li>
            <li><TrendingUp size={20} aria-hidden="true" /><span>Keep a private history and watch how your estimates change.</span></li>
            <li><LockKeyhole size={20} aria-hidden="true" /><span>Your assessments are tied to your account and only visible to you.</span></li>
          </ul>
        </div>
        <p className="auth-aside-note">Not a medical diagnosis. Always speak to a qualified professional about your health.</p>
      </aside>
      <main className="auth-main" id="main">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo /></div>
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </div>
        <Disclaimer className="auth-disclaimer" />
        <p className="auth-back"><Link to="/">Back to home</Link></p>
      </main>
    </div>
  );
}
