import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatCard from '../../components/StatCard';
import RiskBadge from '../../components/RiskBadge';
import { ErrorState, Skeleton, StatGridSkeleton, TableSkeleton } from '../../components/States';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getStatistics } from '../../services/adminService';
import { RISK_META } from '../../utils/constants';
import { formatDateTime, formatPercent } from '../../utils/format';
import '../../css/admin.css';

export default function AdminDashboard() {
  useDocumentTitle('Admin dashboard');
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(getStatistics, []);
  const header = <div className="page-header"><div><h1>Admin dashboard</h1><p>Platform-wide usage and risk distribution.</p></div></div>;

  if (loading) return (<>{header}<StatGridSkeleton /><div className="grid-2"><div className="card"><div className="card-body"><Skeleton height={240} /></div></div><div className="card"><div className="card-body"><Skeleton height={240} /></div></div></div><div className="card" style={{ marginTop: 20 }}><TableSkeleton /></div></>);
  if (error) return (<>{header}<div className="card"><ErrorState title="Unable to load statistics." message={error} onRetry={reload} /></div></>);

  const { totals, distribution, trend, recent } = data;
  const pie = distribution.filter((d) => d.value > 0);

  return (
    <>
      {header}
      <section className="stat-grid" aria-label="Platform totals">
        <StatCard label="Total users" value={totals.totalUsers} icon="Users" sub={`${totals.activeUsers} active`} />
        <StatCard label="Total assessments" value={totals.totalAssessments} icon="ClipboardList" />
        <StatCard label="Low risk" value={totals.low} icon="ShieldCheck" tone="success" sub={`${totals.moderate} moderate`} />
        <StatCard label="Higher risk" value={totals.higher} icon="ShieldAlert" tone="danger" />
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="atr">
          <div className="card-header"><h3 id="atr">Assessment trends</h3><span className="text-muted small">Last 30 days</span></div>
          <div className="card-body chart-box">
            {trend.length === 0 ? <p className="chart-note">No assessments in the last 30 days.</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e3ebea" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 12, fill: '#6b7d83' }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7d83' }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [v, 'Assessments']} />
                  <Bar dataKey="count" fill="#0e6b6b" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <section className="card" aria-labelledby="rd">
          <div className="card-header"><h3 id="rd">Risk distribution</h3></div>
          <div className="card-body chart-box">
            {pie.length === 0 ? <p className="chart-note">No assessments yet.</p> : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3} stroke="none">
                      {pie.map((d) => <Cell key={d.name} fill={RISK_META[d.name].color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="legend">{distribution.map((d) => (<li key={d.name}><i style={{ background: RISK_META[d.name].color }} />{d.name}<b>{d.value}</b></li>))}</ul>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 20 }} aria-labelledby="rec">
        <div className="card-header"><h3 id="rec">Recent assessments</h3></div>
        {recent.length === 0 ? <p className="chart-note" style={{ padding: 24 }}>No assessments yet.</p> : (
          <div className="table-wrap">
            <table className="table table-responsive">
              <thead><tr><th>User</th><th>Date</th><th>Risk level</th><th>Probability</th><th className="right">Action</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r._id}>
                    <td data-label="User"><div className="cell-user"><strong>{r.userId?.name || 'Deleted user'}</strong><small>{r.userId?.email}</small></div></td>
                    <td data-label="Date">{formatDateTime(r.createdAt)}</td>
                    <td data-label="Risk level"><RiskBadge level={r.prediction} /></td>
                    <td data-label="Probability">{formatPercent(r.probability)}</td>
                    <td data-label="Action"><div className="actions"><button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/assessments')}>Manage</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
