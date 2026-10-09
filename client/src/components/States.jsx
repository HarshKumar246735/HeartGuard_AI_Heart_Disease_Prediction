import { AlertTriangle, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="loader-ring" />
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon"><AlertTriangle size={26} aria-hidden="true" /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, message, actionLabel, actionTo, icon: Icon = Inbox }) {
  return (
    <div className="state">
      <div className="state-icon"><Icon size={26} aria-hidden="true" /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionLabel && actionTo && <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>}
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', style }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden="true" />;
}

export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="stat-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card stat-card" key={i}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="40%" height={30} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ padding: 20, display: 'grid', gap: 14 }} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} height={20} />)}
    </div>
  );
}
