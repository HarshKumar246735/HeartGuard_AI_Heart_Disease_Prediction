import { RISK_META } from '../utils/constants';

export default function RiskBadge({ level }) {
  const meta = RISK_META[level];
  return <span className={`badge badge-${meta?.tone || 'neutral'}`}>{meta?.short || level}</span>;
}
