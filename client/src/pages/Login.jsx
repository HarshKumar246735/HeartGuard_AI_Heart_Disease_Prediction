import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { PasswordField, TextField } from '../components/FormControls';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getErrorMessage } from '../utils/format';

const EMAIL_RX = /^\S+@\S+\.\S+$/;

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (f = form) => {
    const e = {};
    if (!EMAIL_RX.test(f.email.trim())) e.email = 'Enter a valid email address.';
    if (!f.password) e.password = 'Enter your password.';
    return e;
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur = (e) => setErrors((prev) => ({ ...prev, [e.target.name]: validate()[e.target.name] }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    setFormError('');
    try {
      const user = await login({ email: form.email.trim(), password: form.password }, remember);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to log in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Log in" subtitle="Welcome back. Enter your details to continue." footer={<>New to HeartGuard AI? <Link to="/register">Create an account</Link></>}>
      <form onSubmit={onSubmit} noValidate className="auth-form">
        {formError && <div className="alert alert-error" role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{formError}</span></div>}
        <TextField label="Email" name="email" type="email" autoComplete="email" icon={Mail} value={form.email} onChange={onChange} onBlur={onBlur} error={errors.email} required placeholder="you@example.com" />
        <PasswordField label="Password" name="password" autoComplete="current-password" value={form.password} onChange={onChange} onBlur={onBlur} error={errors.password} required />
        <div className="auth-row">
          <label className="checkbox"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" block loading={loading}>{loading ? 'Logging in…' : 'Log in'}</Button>
      </form>
    </AuthLayout>
  );
}
