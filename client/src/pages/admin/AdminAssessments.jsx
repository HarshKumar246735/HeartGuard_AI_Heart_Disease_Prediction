import { useEffect, useState } from 'react';
import { ClipboardList, Eye, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import RiskBadge from '../../components/RiskBadge';
import { FactorList, InputSummary } from '../../components/AssessmentParts';
import { EmptyState, ErrorState, PageLoader, TableSkeleton } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { deleteAdminAssessment, getAdminAssessment, listAllAssessments } from '../../services/adminService';
import { formatDateTime, formatPercent, getErrorMessage } from '../../utils/format';
import '../../css/admin.css';
import '../../css/history.css';
import '../../css/result.css';

function AssessmentDetail({ id, onClose }) {
  const { data: a, loading, error, reload } = useFetch(() => getAdminAssessment(id), [id]);
  return (
    <Modal title="Assessment details" onClose={onClose}>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <p className="text-secondary" style={{ marginBottom: 12 }}>{a.userId?.name || 'Deleted user'} · {formatDateTime(a.createdAt)} · <RiskBadge level={a.prediction} /> <b>{formatPercent(a.probability)}</b></p>
          <InputSummary a={a} />
          <h4 className="summary-sub">Factors</h4>
          <FactorList factors={a.factors} />
        </>
      )}
      <div className="modal-actions"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

export default function AdminAssessments() {
  useDocumentTitle('Manage assessments');
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', risk: '', from: '', to: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewId, setViewId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), 300); return () => clearTimeout(t); }, [filters.search]);
  const set = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const { data, loading, error, reload } = useFetch(
    () => listAllAssessments({ search: debouncedSearch || undefined, risk: filters.risk || undefined, from: filters.from || undefined, to: filters.to || undefined }),
    [debouncedSearch, filters.risk, filters.from, filters.to]
  );

  const confirmDelete = async () => {
    setBusy(true);
    try { await deleteAdminAssessment(toDelete._id); toast.success('Assessment deleted.'); setToDelete(null); reload(); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to delete this assessment.')); }
    finally { setBusy(false); }
  };
  const hasFilters = Boolean(filters.search || filters.risk || filters.from || filters.to);

  return (
    <>
      <div className="page-header"><div><h1>Assessments</h1><p>Review all assessments and remove inappropriate records.</p></div></div>
      <div className="card">
        <div className="toolbar filters-grid">
          <div className="input-wrap has-icon search-box wide">
            <span className="input-icon"><Search size={18} aria-hidden="true" /></span>
            <input className="input" type="search" name="search" placeholder="Search by user name or email" value={filters.search} onChange={set} aria-label="Search by user" />
          </div>
          <select className="select" name="risk" value={filters.risk} onChange={set} aria-label="Filter by risk level">
            <option value="">All risk levels</option><option value="Low">Low</option><option value="Moderate">Moderate</option><option value="Higher">Higher</option>
          </select>
          <input className="input" type="date" name="from" value={filters.from} onChange={set} aria-label="From date" />
          <input className="input" type="date" name="to" value={filters.to} onChange={set} aria-label="To date" />
          {hasFilters && <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ search: '', risk: '', from: '', to: '' })}>Clear</button>}
        </div>
        {loading ? <TableSkeleton /> : error ? <ErrorState title="Unable to load assessments." message={error} onRetry={reload} /> :
          data.length === 0 ? <EmptyState icon={ClipboardList} title="No assessments found." message={hasFilters ? 'Try adjusting your filters.' : 'Assessments will appear here once users submit them.'} /> : (
            <div className="table-wrap">
              <table className="table table-responsive">
                <thead><tr><th>User</th><th>Date</th><th>Risk level</th><th>Probability</th><th className="right">Actions</th></tr></thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r._id}>
                      <td data-label="User"><div className="cell-user"><strong>{r.userId?.name || 'Deleted user'}</strong><small>{r.userId?.email}</small></div></td>
                      <td data-label="Date">{formatDateTime(r.createdAt)}</td>
                      <td data-label="Risk level"><RiskBadge level={r.prediction} /></td>
                      <td data-label="Probability">{formatPercent(r.probability)}</td>
                      <td data-label="Actions">
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setViewId(r._id)}><Eye size={15} aria-hidden="true" /> View</button>
                          <button className="btn btn-danger-outline btn-sm btn-icon" onClick={() => setToDelete(r)} aria-label="Delete assessment"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      {viewId && <AssessmentDetail id={viewId} onClose={() => setViewId(null)} />}
      {toDelete && <ConfirmDialog title="Delete this assessment?" busy={busy} onCancel={() => setToDelete(null)} onConfirm={confirmDelete}
        message={`The assessment by ${toDelete.userId?.name || 'a deleted user'} will be permanently removed.`} />}
    </>
  );
}
