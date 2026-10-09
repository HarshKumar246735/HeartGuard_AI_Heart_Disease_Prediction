import Icon from './Icon';

export default function StatCard({ label, value, sub, icon, tone = '', small = false }) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}><Icon name={icon} size={20} /></span>
      </div>
      <div className={`stat-value ${small ? 'small' : ''}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
