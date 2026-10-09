import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import Button from '../components/Button';
import Disclaimer from '../components/Disclaimer';
import { EmptyState, ErrorState, TableSkeleton } from '../components/States';
import { useToast } from '../context/ToastContext';
import useFetch from '../hooks/useFetch';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { downloadReport, listAssessments } from '../services/assessmentService';
import { formatDateTime, formatPercent, getErrorMessage } from '../utils/format';
import '../css/result.css';

export default function Reports() {
  useDocumentTitle('Reports');
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const { data, loading, error, reload } = useFetch(() => listAssessments({ sort: 'newest' }), []);

  const download = async (id) => {
    setBusyId(id);
    try { await downloadReport(id); toast.success('Report downloaded.'); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to download the report.')); }
    finally { setBusyId(null); }
  };

  return (
    <>
      <div className="page-header"><div><h1>Reports</h1><p>Download a PDF report for any of your assessments.</p></div></div>
      <div className="card">
        {loading ? <TableSkeleton /> : error ? <ErrorState title="Unable to load your reports." message={error} onRetry={reload} /> :
          data.length === 0 ? <EmptyState icon={FileText} title="No reports yet." message="Complete an assessment to generate your first report." actionLabel="Start your first assessment" actionTo="/assessment/new" /> : (
            <div className="table-wrap">
              <table className="table table-responsive">
                <thead><tr><th>Report</th><th>Risk level</th><th>Probability</th><th className="right">Download</th></tr></thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r._id}>
                      <td data-label="Report"><div className="cell-user"><strong>Heart risk assessment</strong><small>{formatDateTime(r.createdAt)}</small></div></td>
                      <td data-label="Risk level"><RiskBadge level={r.prediction} /></td>
                      <td data-label="Probability">{formatPercent(r.probability)}</td>
                      <td data-label="Download"><div className="actions"><Button size="sm" variant="secondary" loading={busyId === r._id} onClick={() => download(r._id)}><Download size={15} aria-hidden="true" /> PDF</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Disclaimer className="result-disclaimer" />
    </>
  );
}
