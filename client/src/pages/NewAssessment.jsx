import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Heart, SlidersHorizontal, Stethoscope, User } from 'lucide-react';
import Button from '../components/Button';
import Disclaimer from '../components/Disclaimer';
import { NumberField, RadioGroup, SelectField, SwitchField } from '../components/FormControls';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { createAssessment } from '../services/assessmentService';
import { CHEST_PAIN_OPTIONS, INITIAL_FORM, RULES, TOOLTIPS } from '../utils/constants';
import { getErrorMessage, getFieldErrors } from '../utils/format';
import '../css/assessment.css';

function validateField(name, value, form) {
  const rule = RULES[name];
  if (rule) {
    if (value === '' || value === null) return rule.required ? `${rule.label} is required.` : '';
    const n = Number(value);
    if (Number.isNaN(n)) return 'Enter a number.';
    if (rule.integer && !Number.isInteger(n)) return `${rule.label} must be a whole number.`;
    if (n < rule.min || n > rule.max) return `${rule.label} must be between ${rule.min} and ${rule.max} ${rule.unit}.`;
    return '';
  }
  if (name === 'gender' && !value) return 'Select a gender.';
  if (name === 'chestPainType' && !value) return 'Select a chest pain type.';
  return '';
}
const REQUIRED = ['age', 'gender', 'bloodPressure', 'cholesterol', 'bloodSugar', 'chestPainType', 'heartRate'];
const OPTIONAL = ['bmi'];

function Section({ icon: Icon, title, description, badge, children }) {
  return (
    <section className="card form-section">
      <header className="form-section-head">
        <span className="form-section-icon"><Icon size={20} aria-hidden="true" /></span>
        <div>
          <h2>{title} {badge && <span className="badge badge-neutral badge-plain">{badge}</span>}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export default function NewAssessment() {
  useDocumentTitle('New assessment');
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const blur = (e) => setErrors((p) => ({ ...p, [e.target.name]: validateField(e.target.name, form[e.target.name], form) }));
  const fieldProps = (name) => ({ name, value: form[name], onChange: set, onBlur: blur, error: errors[name] });

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    [...REQUIRED, ...OPTIONAL].forEach((k) => { const m = validateField(k, form[k], form); if (m) v[k] = m; });
    setErrors(v);
    if (Object.keys(v).length) {
      setFormError('Please fix the highlighted fields before continuing.');
      document.getElementById(`f-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    setFormError('');
    setLoading(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
      const a = await createAssessment(payload);
      toast.success('Assessment saved successfully.');
      navigate(`/assessment/${a._id}/result`);
    } catch (err) {
      setErrors((p) => ({ ...p, ...getFieldErrors(err) }));
      const msg = getErrorMessage(err, 'Unable to generate assessment.');
      setFormError(msg);
      toast.error(err?.response?.status === 503 ? 'Unable to generate assessment.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const num = (name, extra = {}) => (
    <NumberField {...fieldProps(name)} label={RULES[name].label} unit={RULES[name].unit} min={RULES[name].min} max={RULES[name].max}
      required={RULES[name].required} tooltip={TOOLTIPS[name]} {...extra} />
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>New assessment</h1>
          <p>Answer a few questions to receive an educational risk estimate. It takes about two minutes.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate className="assessment-form">
        {formError && <div className="alert alert-error" role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{formError}</span></div>}

        <Section icon={User} title="Personal information" description="Basic details used by the model.">
          {num('age', { placeholder: '45', step: 1, hint: 'Whole years, 18-100.' })}
          <RadioGroup {...fieldProps('gender')} label="Gender" required tooltip={TOOLTIPS.gender}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
        </Section>

        <Section icon={Stethoscope} title="Health measurements" description="From a recent check-up or blood test, if you have one.">
          {num('bloodPressure', { placeholder: '120', hint: 'Upper (systolic) number at rest.' })}
          {num('cholesterol', { placeholder: '180', hint: 'Total cholesterol.' })}
          {num('bloodSugar', { placeholder: '90', hint: 'Measured after fasting for 8+ hours.' })}
        </Section>

        <Section icon={Heart} title="Heart information" description="Symptoms and exercise response.">
          <SelectField {...fieldProps('chestPainType')} label="Chest pain type" required tooltip={TOOLTIPS.chestPainType} options={CHEST_PAIN_OPTIONS} />
          {num('heartRate', { placeholder: '150', hint: 'Highest rate reached during exercise.' })}
          <div className="span-2">
            <SwitchField name="exerciseAngina" label="Exercise-induced angina" checked={form.exerciseAngina} onChange={set}
              description="Chest pain or tightness during exercise." tooltip={TOOLTIPS.exerciseAngina} />
          </div>
        </Section>

        <Section icon={SlidersHorizontal} title="Lifestyle and profile" badge="Not used in the estimate"
          description="Optional context saved with your assessment. These values do not change the model's result.">
          {num('bmi', { placeholder: '24.5', hint: 'Optional.', required: false })}
          <SelectField {...fieldProps('physicalActivity')} label="Physical activity" tooltip={TOOLTIPS.physicalActivity}
            options={[{ value: 'low', label: 'Low' }, { value: 'moderate', label: 'Moderate' }, { value: 'high', label: 'High' }]} />
          <SelectField {...fieldProps('smoking')} label="Smoking" tooltip={TOOLTIPS.smoking}
            options={[{ value: 'never', label: 'Never' }, { value: 'former', label: 'Former smoker' }, { value: 'current', label: 'Current smoker' }]} />
          <SelectField {...fieldProps('alcohol')} label="Alcohol" tooltip={TOOLTIPS.alcohol}
            options={[{ value: 'none', label: 'None' }, { value: 'occasional', label: 'Occasional' }, { value: 'regular', label: 'Regular' }]} />
        </Section>

        <Disclaimer />
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => { setForm(INITIAL_FORM); setErrors({}); setFormError(''); }} disabled={loading}>Clear form</Button>
          <Button type="submit" size="lg" loading={loading}>{loading ? 'Generating estimate…' : 'Get my risk estimate'}</Button>
        </div>
        {loading && <p className="form-wait text-muted" role="status">The prediction service may take up to a minute if it has been idle.</p>}
      </form>
    </>
  );
}
