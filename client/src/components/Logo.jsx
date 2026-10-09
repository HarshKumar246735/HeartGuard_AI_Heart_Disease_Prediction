import { Link } from 'react-router-dom';

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#10242b" />
      <path d="M16 25s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="#e4685d" />
      <path d="M9 16h4l1.5-3 2.5 6 1.5-3H23" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo-light' : ''}`} aria-label="HeartGuard AI home">
      <LogoMark />
      <span>HeartGuard <em>AI</em></span>
    </Link>
  );
}
