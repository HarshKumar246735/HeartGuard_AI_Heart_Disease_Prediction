import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, FilePlus2, History as HistoryIcon } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import RiskMeter from '../components/RiskMeter';
import { FactorList, InputSummary, InsightList } from '../components/AssessmentParts';
import { ErrorState, PageLoader } from '../components/States';
import Button from '../components/Button';
import useFetch from '../hooks/useFetch';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { downloadReport, getAssessment } from '../services/assessmentService';
import { RISK_META } from '../utils/constants';
import { formatDateTime, getErrorMessage } from '../utils/format';
import '../css/result.css';

const COPY = {
  Low: 'Based on the information provided, your assessment indicates a lower estimated risk.',
  Moderate: 'Based on the information provided, your assessment indicates a moderate estimated risk.',
  Higher: 'Your assessment indicates a higher estimated risk based on the information provided.',
};

export default function AssessmentResult() {
  useDocumentTitle('Your result');
  const { id } = useParams();
  const toast = useToast();
  const { data: a, loading, error, reload } = useFetch(() => getAssessment(id), [id]);
  const [downloading, setDownloading] = useState(false);

  if (loading) return <PageLoader label="Loading your result" />;
  if (error) return <div className="card"><ErrorState title="Unable to load this result." message={error} onRetry={reload} /></div>;

  const meta = RISK_META[a.prediction];
  const pct = Math.round(a.probability * 100);

  const onDownload = async () => {
    setDownloading(true);
    try { await downloadReport(a._id); toast.success('Report downloaded.'); }
    catch (err) { toast.error(getErrorMessage(err, 'Unable to download the report.')); }
    finally { setDownloading(false); }
  };

  return (
    <div className="result-page">
      <section className={`result-hero tone-${meta.tone}`} aria-labelledby="result-title">
        <div>
          <p className="result-kicker">Your heart risk estimate</p>
          <h1 id="result-title">{meta.label}</h1>
          <p className="result-copy">{COPY[a.prediction]}</p>
          <p className="result-date">Assessed on {formatDateTime(a.createdAt)}</p>
        </div>
        <div className="result-score" aria-hidden="true"><span>{pct}</span><small>%</small></div>
        <div className="result-meter"><RiskMeter probability={a.probability} /></div>
      </section>

      <Disclaimer className="result-disclaimer" />

      <div className="result-grid">
        <section className="card" aria-labelledby="sum"><div className="card-header"><h3 id="sum">Assessment summary</h3></div><div className="card-body"><InputSummary a={a} /></div></section>
        <section className="card" aria-labelledby="fac"><div className="card-header"><h3 id="fac">Factors to consider</h3></div><div className="card-body"><FactorList factors={a.factors} /></div></section>
      </div>

      <section className="card" style={{ marginTop: 20 }} aria-labelledby="ins">
        <div className="card-header"><h3 id="ins">General health insights</h3></div>
        <div className="card-body"><InsightList insights={a.insights} /></div>
      </section>

      <div className="result-actions">
        <Button onClick={onDownload} loading={downloading}><Download size={18} aria-hidden="true" /> Download PDF</Button>
        <Link to="/history" className="btn btn-secondary"><HistoryIcon size={18} aria-hidden="true" /> View history</Link>
        <Link to="/assessment/new" className="btn btn-ghost"><FilePlus2 size={18} aria-hidden="true" /> New assessment</Link>
      </div>
    </div>
  );
}
