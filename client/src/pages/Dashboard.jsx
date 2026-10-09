import { Link, useNavigate } from 'react-router-dom';
import { Activity, FilePlus2 } from 'lucide-react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { EmptyState, ErrorState, Skeleton, StatGridSkeleton, TableSkeleton } from '../components/States';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getDashboard } from '../services/assessmentService';
import { formatDate, formatPercent, greeting } from '../utils/format';
import { RISK_META } from '../utils/constants';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(getDashboard, []);

  const header = (
    <div className="page-header">
      <div>
        <h1>{greeting()}, {user.name.split(' ')[0]} 👋</h1>
        <p>Here's an overview of your recent health assessments.</p>
      </div>
      <div className="header-actions">
        <Link to="/assessment/new" className="btn btn-primary btn-lg"><FilePlus2 size={18} aria-hidden="true" /> New Assessment</Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        {header}
        <StatGridSkeleton />
        <div className="grid-2"><div className="card"><div className="card-body"><Skeleton height={240} /></div></div><div className="card"><div className="card-body"><Skeleton height={240} /></div></div></div>
        <div className="card" style={{ marginTop: 20 }}><TableSkeleton /></div>
      </>
    );
  }
  if (error) return <>{header}<div className="card"><ErrorState title="Unable to load your dashboard." message={error} onRetry={reload} /></div></>;

  const { totals, lastAssessment, distribution, trend, recent } = data;
  const trendData = trend.map((t) => ({ date: formatDate(t.createdAt), risk: Math.round(t.probability * 100) }));
  const hasData = totals.total > 0;

  return (
    <>
      {header}
      <section className="stat-grid" aria-label="Summary">
        <StatCard label="Total assessments" value={totals.total} icon="ClipboardCheck" />
        <StatCard label="Low risk" value={totals.low} icon="ShieldCheck" tone="success" sub={`${totals.moderate} moderate`} />
        <StatCard label="Higher risk" value={totals.higher} icon="ShieldAlert" tone="danger" />
        <StatCard label="Last assessment" small value={lastAssessment ? formatDate(lastAssessment.createdAt) : '—'} icon="CalendarClock" tone="warning" sub={lastAssessment ? `${RISK_META[lastAssessment.prediction].short} · ${formatPercent(lastAssessment.probability)}` : 'None yet'} />
      </section>

      {!hasData ? (
        <div className="card">
          <EmptyState icon={Activity} title="No assessments yet." message="Complete your first assessment to see your risk overview and trends here." actionLabel="Start your first assessment" actionTo="/assessment/new" />
        </div>
      ) : (
        <>
          <div className="grid-2">
            <section className="card" aria-labelledby="ro">
              <div className="card-header"><h3 id="ro">Risk overview</h3></div>
              <div className="card-body chart-box">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={distribution.filter((d) => d.value > 0)} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
                      {distribution.filter((d) => d.value > 0).map((d) => <Cell key={d.name} fill={RISK_META[d.name].color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} assessment${v === 1 ? '' : 's'}`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="legend">
                  {distribution.map((d) => (<li key={d.name}><i style={{ background: RISK_META[d.name].color }} />{d.name}<b>{d.value}</b></li>))}
                </ul>
              </div>
            </section>
            <section className="card" aria-labelledby="at">
              <div className="card-header"><h3 id="at">Assessment trend</h3><span className="text-muted small">Estimated probability (%)</span></div>
              <div className="card-body chart-box">
                {trendData.length < 2 ? (
                  <p className="chart-note">Complete at least two assessments to see how your estimate changes over time.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke="#e3ebea" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7d83' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7d83' }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Estimated risk']} />
                      <Line type="monotone" dataKey="risk" stroke="#0e6b6b" strokeWidth={3} dot={{ r: 4, fill: '#0e6b6b' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>

          <section className="card" style={{ marginTop: 20 }} aria-labelledby="ra">
            <div className="card-header"><h3 id="ra">Recent assessments</h3><Link to="/history" className="btn btn-ghost btn-sm">View all</Link></div>
            <div className="table-wrap">
              <table className="table table-responsive">
                <thead><tr><th>Date</th><th>Risk level</th><th>Probability</th><th className="right">Action</th></tr></thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r._id}>
                      <td data-label="Date">{formatDate(r.createdAt)}</td>
                      <td data-label="Risk level"><RiskBadge level={r.prediction} /></td>
                      <td data-label="Probability">{formatPercent(r.probability)}</td>
                      <td data-label="Action"><div className="actions"><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/history/${r._id}`)}>View</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
