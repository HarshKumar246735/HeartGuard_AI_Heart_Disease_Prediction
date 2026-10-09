import Icon from '../components/Icon';
import Disclaimer from '../components/Disclaimer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { INSIGHT_TOPICS } from '../utils/constants';
import '../css/result.css';

export default function HealthInsights() {
  useDocumentTitle('Health insights');
  return (
    <>
      <div className="page-header"><div><h1>Health insights</h1><p>Short, general explanations of the topics behind your assessment.</p></div></div>
      <div className="insight-grid">
        {INSIGHT_TOPICS.map((t) => (
          <article key={t.title} className="card card-hover insight-card">
            <span className="stat-icon"><Icon name={t.icon} size={22} /></span>
            <h3>{t.title}</h3>
            <p>{t.body}</p>
            <ul>{t.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </article>
        ))}
      </div>
      <Disclaimer className="result-disclaimer" />
    </>
  );
}
