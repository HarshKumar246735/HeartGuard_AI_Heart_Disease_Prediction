import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, UserRound } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { PasswordField, PasswordStrength, TextField } from '../components/FormControls';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getErrorMessage, getFieldErrors } from '../utils/format';

const EMAIL_RX = /^\S+@\S+\.\S+$/;

export function validateRegister(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name (at least 2 characters).';
  if (!EMAIL_RX.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.password.length < 8) e.password = 'Use at least 8 characters.';
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'Include at least one letter and one number.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
}

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur = (e) => setErrors((prev) => ({ ...prev, [e.target.name]: validateRegister(form)[e.target.name] }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    setFormError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created successfully.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
      setFormError(getErrorMessage(err, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute." footer={<>Already have an account? <Link to="/login">Log in</Link></>}>
      <form onSubmit={onSubmit} noValidate className="auth-form">
        {formError && <div className="alert alert-error" role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{formError}</span></div>}
        <TextField label="Full name" name="name" icon={UserRound} autoComplete="name" value={form.name} onChange={onChange} onBlur={onBlur} error={errors.name} required placeholder="Alex Morgan" />
        <TextField label="Email" name="email" type="email" icon={Mail} autoComplete="email" value={form.email} onChange={onChange} onBlur={onBlur} error={errors.email} required placeholder="you@example.com" />
        <div className="auth-stack">
          <PasswordField label="Password" name="password" autoComplete="new-password" value={form.password} onChange={onChange} onBlur={onBlur} error={errors.password} required />
          <PasswordStrength password={form.password} />
        </div>
        <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" value={form.confirm} onChange={onChange} onBlur={onBlur} error={errors.confirm} required />
        <Button type="submit" size="lg" block loading={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
        <p className="auth-fine">By creating an account you agree that HeartGuard AI gives educational estimates only, not medical advice.</p>
      </form>
    </AuthLayout>
  );
}
