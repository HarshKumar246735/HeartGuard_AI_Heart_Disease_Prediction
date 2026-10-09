import { AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import { CHEST_PAIN_LABELS } from '../utils/constants';
import { capitalize } from '../utils/format';
import '../css/result.css';

const FACTOR_ICON = { ok: CheckCircle2, note: Info, attention: AlertTriangle };

export function FactorList({ factors = [] }) {
  return (
    <ul className="factor-list">
      {factors.map((f) => {
        const Icon = FACTOR_ICON[f.status] || Info;
        return (
          <li key={f.key} className={`factor factor-${f.status}`}>
            <Icon size={20} aria-hidden="true" />
            <div>
              <h4>{f.title} {!f.usedByModel && <span className="badge badge-neutral badge-plain">Not in model</span>}</h4>
              <p>{f.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function InsightList({ insights = [] }) {
  return (
    <ul className="insight-list">
      {insights.map((t) => (
        <li key={t}><Lightbulb size={18} aria-hidden="true" /><span>{t}</span></li>
      ))}
    </ul>
  );
}

export function InputSummary({ a }) {
  const used = [
    ['Age', `${a.age} years`],
    ['Gender', capitalize(a.gender)],
    ['Blood pressure', `${a.bloodPressure} mmHg`],
    ['Cholesterol', `${a.cholesterol} mg/dL`],
    ['Fasting blood sugar', `${a.bloodSugar} mg/dL`],
    ['Max heart rate', `${a.heartRate} bpm`],
    ['Chest pain type', CHEST_PAIN_LABELS[a.chestPainType]],
    ['Exercise-induced angina', a.exerciseAngina ? 'Yes' : 'No'],
  ];
  const profile = [
    a.bmi && ['BMI', String(a.bmi)],
    a.smoking && ['Smoking', capitalize(a.smoking)],
    a.alcohol && ['Alcohol', capitalize(a.alcohol)],
    a.physicalActivity && ['Physical activity', capitalize(a.physicalActivity)],
  ].filter(Boolean);
  return (
    <>
      <dl className="summary-grid">
        {used.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
      {profile.length > 0 && (
        <>
          <h4 className="summary-sub">Additional profile information <span className="badge badge-neutral badge-plain">Not used in the estimate</span></h4>
          <dl className="summary-grid">
            {profile.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>
        </>
      )}
    </>
  );
}
