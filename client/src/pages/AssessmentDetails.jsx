import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import RiskBadge from '../components/RiskBadge';
import RiskMeter from '../components/RiskMeter';
import ConfirmDialog from '../components/ConfirmDialog';
import Button from '../components/Button';
import { FactorList, InputSummary, InsightList } from '../components/AssessmentParts';
import { ErrorState, PageLoader } from '../components/States';
import useFetch from '../hooks/useFetch';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { deleteAssessment, downloadReport, getAssessment } from '../services/assessmentService';
import { RISK_META } from '../utils/constants';
import { formatDateTime, formatPercent, getErrorMessage } from '../utils/format';
import '../css/result.css';

export default function AssessmentDetails() {
  useDocumentTitle('Assessment details');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: a, loading, error, reload } = useFetch(() => getAssessment(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (loading) return <PageLoader label="Loading assessment" />;
  if (error) return (
    <>
      <Link to="/history" className="back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to history</Link>
      <div className="card"><ErrorState title="Unable to load this assessment." message={error} onRetry={reload} /></div>
    </>
  );

  const meta = RISK_META[a.prediction];
  const onDelete = async () => {
    setBusy(true);
    try { await deleteAssessment(a._id); toast.success('Assessment deleted.'); navigate('/history'); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to delete this assessment.')); setBusy(false); }
  };
  const onDownload = async () => {
    setDownloading(true);
    try { await downloadReport(a._id); toast.success('Report downloaded.'); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to download the report.')); }
    finally { setDownloading(false); }
  };

  return (
    <>
      <Link to="/history" className="back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to history</Link>
      <div className="page-header">
        <div><h1>Assessment details</h1><p>{formatDateTime(a.createdAt)}</p></div>
        <div className="header-actions">
          <Button onClick={onDownload} loading={downloading}><Download size={16} aria-hidden="true" /> Download PDF</Button>
          <Button variant="danger-outline" onClick={() => setConfirm(true)}><Trash2 size={16} aria-hidden="true" /> Delete assessment</Button>
        </div>
      </div>

      <section className="card detail-prediction" aria-labelledby="pred">
        <div className="card-body">
          <div className="detail-prediction-top">
            <div>
              <h3 id="pred">Prediction</h3>
              <p className="detail-level" style={{ color: meta.color }}>{meta.label}</p>
            </div>
            <div className="detail-prob"><span>{formatPercent(a.probability)}</span><small>probability</small> <RiskBadge level={a.prediction} /></div>
          </div>
          <RiskMeter probability={a.probability} />
        </div>
      </section>

      <div className="result-grid" style={{ marginTop: 20 }}>
        <section className="card" aria-labelledby="inp"><div className="card-header"><h3 id="inp">Input data</h3></div><div className="card-body"><InputSummary a={a} /></div></section>
        <section className="card" aria-labelledby="fc"><div className="card-header"><h3 id="fc">Assessment summary</h3></div><div className="card-body"><FactorList factors={a.factors} /></div></section>
      </div>
      <section className="card" style={{ marginTop: 20 }} aria-labelledby="gi">
        <div className="card-header"><h3 id="gi">General insights</h3></div>
        <div className="card-body"><InsightList insights={a.insights} /></div>
      </section>
      <Disclaimer className="result-disclaimer" />

      {confirm && <ConfirmDialog title="Delete this assessment?" busy={busy} onCancel={() => setConfirm(false)} onConfirm={onDelete}
        message="This assessment will be permanently removed. This can't be undone." />}
    </>
  );
}
