import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Trash2, UserRound } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { PasswordField, PasswordStrength, TextField } from '../components/FormControls';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import * as authService from '../services/authService';
import { formatDate, getErrorMessage, getFieldErrors } from '../utils/format';
import '../css/profile.css';

export default function Profile() {
  useDocumentTitle('Profile');
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [info, setInfo] = useState({ name: user.name, email: user.email });
  const [infoErr, setInfoErr] = useState({});
  const [savingInfo, setSavingInfo] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErr, setPwErr] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [delPw, setDelPw] = useState('');
  const [delErr, setDelErr] = useState('');
  const [deleting, setDeleting] = useState(false);

  const saveInfo = async (e) => {
    e.preventDefault();
    const v = {};
    if (info.name.trim().length < 2) v.name = 'Enter your full name (at least 2 characters).';
    if (!/^\S+@\S+\.\S+$/.test(info.email.trim())) v.email = 'Enter a valid email address.';
    setInfoErr(v);
    if (Object.keys(v).length) return;
    setSavingInfo(true);
    try {
      const updated = await authService.updateProfile({ name: info.name.trim(), email: info.email.trim() });
      setUser(updated);
      toast.success('Profile updated.');
    } catch (err) {
      setInfoErr(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Unable to update your profile.'));
    } finally { setSavingInfo(false); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    const v = {};
    if (!pw.currentPassword) v.currentPassword = 'Enter your current password.';
    if (pw.newPassword.length < 8) v.newPassword = 'Use at least 8 characters.';
    else if (!/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword)) v.newPassword = 'Include at least one letter and one number.';
    if (pw.confirm !== pw.newPassword) v.confirm = 'Passwords do not match.';
    setPwErr(v);
    if (Object.keys(v).length) return;
    setSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password updated.');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwErr({ currentPassword: err?.response?.status === 400 ? getErrorMessage(err) : undefined, ...getFieldErrors(err) });
      toast.error(getErrorMessage(err, 'Unable to update your password.'));
    } finally { setSavingPw(false); }
  };

  const doDelete = async (e) => {
    e.preventDefault();
    if (!delPw) { setDelErr('Enter your password to confirm.'); return; }
    setDeleting(true);
    try {
      await authService.deleteAccount(delPw);
      logout();
      toast.success('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      setDelErr(getErrorMessage(err, 'Unable to delete your account.'));
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-header"><div><h1>Profile</h1><p>Manage your account details and security.</p></div></div>
      <div className="profile-grid">
        <section className="card" aria-labelledby="pi">
          <div className="card-header"><h3 id="pi">Profile information</h3><span className="badge badge-neutral badge-plain">Member since {formatDate(user.createdAt)}</span></div>
          <form className="card-body profile-form" onSubmit={saveInfo} noValidate>
            <TextField label="Full name" name="name" icon={UserRound} value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} error={infoErr.name} required autoComplete="name" />
            <TextField label="Email" name="email" type="email" icon={Mail} value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} error={infoErr.email} required autoComplete="email" />
            <div><Button type="submit" loading={savingInfo}>Save changes</Button></div>
          </form>
        </section>

        <section className="card" aria-labelledby="sec">
          <div className="card-header"><h3 id="sec">Security</h3></div>
          <form className="card-body profile-form" onSubmit={savePw} noValidate>
            <PasswordField label="Current password" name="currentPassword" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} error={pwErr.currentPassword} required />
            <div className="auth-stack">
              <PasswordField label="New password" name="newPassword" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} error={pwErr.newPassword} required />
              <PasswordStrength password={pw.newPassword} />
            </div>
            <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErr.confirm} required />
            <div><Button type="submit" loading={savingPw}>Change password</Button></div>
          </form>
        </section>

        <section className="card account-card" aria-labelledby="acc">
          <div className="card-header"><h3 id="acc">Account</h3></div>
          <div className="card-body account-actions">
            <div><strong>Log out</strong><p className="text-secondary">End your session on this device.</p></div>
            <Button variant="secondary" onClick={() => { logout(); toast.info('You have been signed out.'); navigate('/login'); }}><LogOut size={16} aria-hidden="true" /> Log out</Button>
          </div>
          <div className="card-body account-actions danger-zone">
            <div><strong>Delete account</strong><p className="text-secondary">Permanently removes your account and all saved assessments.</p></div>
            <Button variant="danger-outline" onClick={() => { setShowDelete(true); setDelPw(''); setDelErr(''); }}><Trash2 size={16} aria-hidden="true" /> Delete account</Button>
          </div>
        </section>
      </div>

      {showDelete && (
        <Modal title="Delete your account?" onClose={() => !deleting && setShowDelete(false)}>
          <form onSubmit={doDelete} noValidate>
            <p className="text-secondary" style={{ marginBottom: 16 }}>This permanently deletes your account and every assessment you have saved. This can't be undone.</p>
            <PasswordField label="Confirm with your password" name="deletePassword" value={delPw} onChange={(e) => { setDelPw(e.target.value); setDelErr(''); }} error={delErr} required autoComplete="current-password" />
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowDelete(false)} disabled={deleting}>Cancel</Button>
              <Button type="submit" variant="danger" loading={deleting}>Delete account</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
