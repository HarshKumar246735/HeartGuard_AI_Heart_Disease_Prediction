import { Link } from 'react-router-dom';
import Logo from './Logo';
import { DISCLAIMER } from '../utils/constants';

export default function PublicFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo light />
            <p>Understand Your Heart Risk. Make Better Health Decisions.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="/#about">About</a>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
        <p className="footer-disclaimer">{DISCLAIMER}</p>
        <p className="footer-copy">© {new Date().getFullYear()} HeartGuard AI</p>
      </div>
    </footer>
  );
}
