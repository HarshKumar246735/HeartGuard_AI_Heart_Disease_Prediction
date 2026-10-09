import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Download, Eye, Search, Trash2 } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState, ErrorState, TableSkeleton } from '../components/States';
import { useToast } from '../context/ToastContext';
import useFetch from '../hooks/useFetch';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { deleteAssessment, downloadReport, listAssessments } from '../services/assessmentService';
import { formatDate, formatDateTime, formatPercent, getErrorMessage } from '../utils/format';
import '../css/history.css';
import '../css/result.css';

const FILTERS = ['All', 'Low', 'Moderate', 'Higher'];

export default function History() {
  useDocumentTitle('History');
  const toast = useToast();
  const navigate = useNavigate();
  const [risk, setRisk] = useState('All');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(() => listAssessments({ risk: risk === 'All' ? undefined : risk, sort }), [risk, sort]);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => `${formatDate(r.createdAt)} ${r.prediction} ${r.prediction} risk ${Math.round(r.probability * 100)}%`.toLowerCase().includes(q));
  }, [data, search]);

  const confirmDelete = async () => {
    setBusy(true);
    try { await deleteAssessment(toDelete._id); toast.success('Assessment deleted.'); setToDelete(null); reload(); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to delete this assessment.')); }
    finally { setBusy(false); }
  };

  const download = async (id) => {
    try { await downloadReport(id); toast.success('Report downloaded.'); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to download the report.')); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Assessment history</h1><p>Review, download or remove your past assessments.</p></div>
        <div className="header-actions"><Link to="/assessment/new" className="btn btn-primary">New assessment</Link></div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter by risk level">
            {FILTERS.map((f) => (
              <button key={f} className={`chip ${risk === f ? 'active' : ''}`} aria-pressed={risk === f} onClick={() => setRisk(f)}>{f}</button>
            ))}
          </div>
          <div className="toolbar-right">
            <div className="input-wrap has-icon search-box">
              <span className="input-icon"><Search size={18} aria-hidden="true" /></span>
              <input className="input" type="search" placeholder="Search by date or result" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search assessments by date or result" />
            </div>
            <select className="select sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort assessments">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest risk</option>
            </select>
          </div>
        </div>

        {loading ? <TableSkeleton /> : error ? (
          <ErrorState title="Unable to load your assessments." message={error} onRetry={reload} />
        ) : rows.length === 0 ? (
          data.length === 0 && risk === 'All' ? (
            <EmptyState icon={ClipboardList} title="No assessments yet." message="Your completed assessments will appear here." actionLabel="Start your first assessment" actionTo="/assessment/new" />
          ) : (
            <EmptyState icon={Search} title="No matching assessments." message="Try a different filter or search term." />
          )
        ) : (
          <div className="table-wrap">
            <table className="table table-responsive">
              <thead><tr><th>Assessment date</th><th>Risk level</th><th>Probability</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td data-label="Date">{formatDateTime(r.createdAt)}</td>
                    <td data-label="Risk level"><RiskBadge level={r.prediction} /></td>
                    <td data-label="Probability"><strong>{formatPercent(r.probability)}</strong></td>
                    <td data-label="Actions">
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/history/${r._id}`)}><Eye size={15} aria-hidden="true" /> View</button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => download(r._id)} aria-label={`Download PDF for ${formatDate(r.createdAt)}`}><Download size={16} /></button>
                        <button className="btn btn-danger-outline btn-sm btn-icon" onClick={() => setToDelete(r)} aria-label={`Delete assessment from ${formatDate(r.createdAt)}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog title="Delete this assessment?" busy={busy} onCancel={() => setToDelete(null)} onConfirm={confirmDelete}
          message={`The assessment from ${formatDate(toDelete.createdAt)} will be permanently removed. This can't be undone.`} />
      )}
    </>
  );
}
