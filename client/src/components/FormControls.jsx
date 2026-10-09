import { useId, useState } from 'react';
import { AlertCircle, Eye, EyeOff, HelpCircle } from 'lucide-react';

export function Tooltip({ title, text }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="tip" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="tip-btn"
        aria-label={`Why do we ask this? ${title}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <HelpCircle size={16} aria-hidden="true" />
      </button>
      {open && (
        <span className="tip-panel" role="tooltip" id={id}>
          <strong>Why do we ask this?</strong>
          {text}
        </span>
      )}
    </span>
  );
}

function FieldShell({ id, label, required, hint, error, tooltip, children }) {
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={id}>{label}{required && <span className="required-mark" aria-hidden="true"> *</span>}</label>
        {tooltip && <Tooltip title={label} text={tooltip} />}
      </div>
      {children}
      {hint && !error && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${id}-err`} role="alert"><AlertCircle size={14} aria-hidden="true" />{error}</span>}
    </div>
  );
}

const describe = (id, hint, error) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export function TextField({ label, name, value, onChange, onBlur, error, hint, required, icon: Icon, type = 'text', tooltip, ...rest }) {
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} tooltip={tooltip}>
      <div className={`input-wrap ${Icon ? 'has-icon' : ''}`}>
        {Icon && <span className="input-icon"><Icon size={18} aria-hidden="true" /></span>}
        <input id={id} name={name} type={type} className="input" value={value} onChange={onChange} onBlur={onBlur}
          aria-invalid={Boolean(error)} aria-describedby={describe(id, hint, error)} aria-required={required} {...rest} />
      </div>
    </FieldShell>
  );
}

export function PasswordField({ label, name, value, onChange, onBlur, error, hint, required, autoComplete }) {
  const [show, setShow] = useState(false);
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <div className="input-wrap has-icon has-action">
        <input id={id} name={name} type={show ? 'text' : 'password'} className="input" value={value} onChange={onChange} onBlur={onBlur}
          autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={describe(id, hint, error)} aria-required={required} />
        <button type="button" className="btn btn-ghost btn-icon input-action" onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FieldShell>
  );
}

export function NumberField({ label, name, value, onChange, onBlur, error, hint, unit, required, tooltip, placeholder, min, max, step = 'any' }) {
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} tooltip={tooltip}>
      <div className="input-wrap">
        <input id={id} name={name} type="number" inputMode="decimal" className="input" value={value} onChange={onChange} onBlur={onBlur}
          placeholder={placeholder} min={min} max={max} step={step} aria-invalid={Boolean(error)}
          aria-describedby={describe(id, hint, error)} aria-required={required} />
        {unit && <span className="input-unit">{unit}</span>}
      </div>
    </FieldShell>
  );
}

export function RadioGroup({ label, name, value, onChange, options, error, hint, required, tooltip }) {
  const id = `f-${name}`;
  return (
    <div className="field" role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describe(id, hint, error)}>
      <div className="field-label">
        <span id={`${id}-label`}>{label}{required && <span className="required-mark" aria-hidden="true"> *</span>}</span>
        {tooltip && <Tooltip title={label} text={tooltip} />}
      </div>
      <div className="segmented">
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange({ target: { name, value: o.value } })} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {hint && !error && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${id}-err`} role="alert"><AlertCircle size={14} aria-hidden="true" />{error}</span>}
    </div>
  );
}

export function SelectField({ label, name, value, onChange, options, placeholder = 'Select…', error, hint, required, tooltip }) {
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} tooltip={tooltip}>
      <select id={id} name={name} className="select" value={value} onChange={onChange} aria-invalid={Boolean(error)}
        aria-describedby={describe(id, hint, error)} aria-required={required}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldShell>
  );
}

export function SwitchField({ label, name, checked, onChange, description, tooltip }) {
  const id = `f-${name}`;
  return (
    <div className="field">
      <label className="switch" htmlFor={id}>
        <span>
          <span className="switch-text">{label}{tooltip && <> <Tooltip title={label} text={tooltip} /></>}</span>
          {description && <span className="field-hint" style={{ display: 'block' }}>{description}</span>}
        </span>
        <input id={id} name={name} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange({ target: { name, value: e.target.checked } })} />
        <span className="switch-track" aria-hidden="true" />
      </label>
    </div>
  );
}

export function PasswordStrength({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) score += 1;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="strength" data-level={score} aria-live="polite">
      <div className="strength-bars" aria-hidden="true"><i /><i /><i /><i /></div>
      <span className="strength-text">Password strength: {labels[score]}. Use 8+ characters with a letter and a number.</span>
    </div>
  );
}
