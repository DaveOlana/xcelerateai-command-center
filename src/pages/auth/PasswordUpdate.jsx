import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import StatusBanner from '../../components/ui/StatusBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Field } from './Login.jsx';

export default function PasswordUpdate() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmation) return setMessage('Passwords must match.');
    try { await auth.updatePassword(password); setMessage('Password updated. You can return to your account.'); } catch { setMessage(''); }
  };
  return <AuthShell eyebrow="Account recovery" title="Choose a new password" description="This page uses the authenticated recovery session established by Supabase." footer={<Link to="/settings#account" className="font-semibold text-brand-blue">Open account settings</Link>}>
    {message && <StatusBanner type={message.startsWith('Password updated') ? 'success' : 'error'} message={message} />}
    {auth.error && <StatusBanner type="error" message={auth.error} onClose={auth.clearError} />}
    <form onSubmit={submit} className="mt-5 space-y-4"><Field label="New password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} /><Field label="Confirm password" type="password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" minLength={8} /><button disabled={!auth.configured || !auth.session} className="btn-primary w-full justify-center px-5 py-2.5 text-sm">Update password</button></form>
  </AuthShell>;
}
