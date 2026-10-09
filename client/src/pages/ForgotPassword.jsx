import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Password reset by email requires an email provider (SMTP/SendGrid, etc.) which is not configured in this build.
// This page is honest about that and points to the working alternative (Profile > Change password).
export default function ForgotPassword() {
  useDocumentTitle('Forgot password');
  return (
    <AuthLayout title="Forgot your password?" subtitle="Reset by email isn't enabled in this version.">
      <div className="state" style={{ padding: '8px 0 0' }}>
        <div className="state-icon"><KeyRound size={26} aria-hidden="true" /></div>
        <p style={{ maxWidth: 'none' }}>
          If you can still log in, change your password from <strong>Profile → Change password</strong>.
          If you are locked out, ask the administrator of this deployment to help you recover access.
        </p>
        <Link to="/login" className="btn btn-primary btn-block">Back to log in</Link>
      </div>
    </AuthLayout>
  );
}
