import { useEffect, useState } from 'react';
import { Eye, Search, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import RiskBadge from '../../components/RiskBadge';
import { EmptyState, ErrorState, PageLoader, TableSkeleton } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { deleteUser, getUser, listUsers, setUserStatus } from '../../services/adminService';
import { formatDate, formatDateTime, formatPercent, getErrorMessage } from '../../utils/format';
import '../../css/admin.css';
import '../../css/history.css';
import '../../css/result.css';

function UserDetail({ id, onClose }) {
  const { data, loading, error, reload } = useFetch(() => getUser(id), [id]);
  return (
    <Modal title="User details" onClose={onClose}>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <dl className="summary-grid one-col">
            <div><dt>Name</dt><dd>{data.user.name}</dd></div>
            <div><dt>Email</dt><dd>{data.user.email}</dd></div>
            <div><dt>Role</dt><dd>{data.user.role}</dd></div>
            <div><dt>Status</dt><dd>{data.user.isActive ? 'Active' : 'Deactivated'}</dd></div>
            <div><dt>Joined</dt><dd>{formatDate(data.user.createdAt)}</dd></div>
            <div><dt>Assessments</dt><dd>{data.assessmentCount}</dd></div>
          </dl>
          {data.assessments.length > 0 && (
            <>
              <h4 className="summary-sub">Latest assessments</h4>
              <ul className="mini-list">
                {data.assessments.map((a) => (<li key={a._id}><span>{formatDateTime(a.createdAt)}</span><RiskBadge level={a.prediction} /><b>{formatPercent(a.probability)}</b></li>))}
              </ul>
            </>
          )}
        </>
      )}
      <div className="modal-actions"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

export default function AdminUsers() {
  useDocumentTitle('Manage users');
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [viewId, setViewId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebounced(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const { data, loading, error, reload } = useFetch(() => listUsers({ search: debounced || undefined }), [debounced]);

  const toggle = async (u) => {
    try { await setUserStatus(u._id, !u.isActive); toast.success(u.isActive ? 'User deactivated.' : 'User activated.'); reload(); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to update this user.')); }
  };
  const confirmDelete = async () => {
    setBusy(true);
    try { await deleteUser(toDelete._id); toast.success('User deleted.'); setToDelete(null); reload(); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to delete this user.')); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="page-header"><div><h1>Users</h1><p>Search, review and manage accounts.</p></div></div>
      <div className="card">
        <div className="toolbar">
          <div className="input-wrap has-icon search-box wide">
            <span className="input-icon"><Search size={18} aria-hidden="true" /></span>
            <input className="input" type="search" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
          </div>
          {data && <span className="text-muted small">{data.length} user{data.length === 1 ? '' : 's'}</span>}
        </div>
        {loading ? <TableSkeleton /> : error ? <ErrorState title="Unable to load users." message={error} onRetry={reload} /> :
          data.length === 0 ? <EmptyState icon={Users} title="No users found." message={debounced ? 'Try a different search.' : 'Registered users will appear here.'} /> : (
            <div className="table-wrap">
              <table className="table table-responsive">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Assessments</th><th>Joined</th><th className="right">Actions</th></tr></thead>
                <tbody>
                  {data.map((u) => {
                    const self = u._id === me._id;
                    return (
                      <tr key={u._id}>
                        <td data-label="Name"><strong>{u.name}</strong>{u.isDemo && <> <span className="badge badge-info badge-plain">Demo</span></>}</td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="Role"><span className={`badge badge-plain ${u.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>{u.role}</span></td>
                        <td data-label="Status"><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
                        <td data-label="Assessments">{u.assessmentCount}</td>
                        <td data-label="Joined">{formatDate(u.createdAt)}</td>
                        <td data-label="Actions">
                          <div className="actions">
                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setViewId(u._id)} aria-label={`View ${u.name}`}><Eye size={16} /></button>
                            <button className="btn btn-secondary btn-sm btn-icon" disabled={self} onClick={() => toggle(u)} aria-label={`${u.isActive ? 'Deactivate' : 'Activate'} ${u.name}`}>{u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}</button>
                            <button className="btn btn-danger-outline btn-sm btn-icon" disabled={self || u.role === 'admin'} onClick={() => setToDelete(u)} aria-label={`Delete ${u.name}`}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
      {viewId && <UserDetail id={viewId} onClose={() => setViewId(null)} />}
      {toDelete && <ConfirmDialog title={`Delete ${toDelete.name}?`} busy={busy} onCancel={() => setToDelete(null)} onConfirm={confirmDelete}
        message={`This permanently deletes the account and its ${toDelete.assessmentCount} assessment${toDelete.assessmentCount === 1 ? '' : 's'}.`} />}
    </>
  );
}
