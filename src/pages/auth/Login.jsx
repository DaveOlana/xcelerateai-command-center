import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import StatusBanner from '../../components/ui/StatusBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await auth.login(email.trim(), password);
      navigate('/settings#account');
    } catch {
      // AuthContext exposes the safe provider message.
    } finally {
      setBusy(false);
    }
  };

  return <AuthShell eyebrow="Account" title="Welcome back" description="Sign in for verified cloud identity. Your learning remains available locally without an account." footer={<>New here? <Link to="/auth/register" className="font-semibold text-brand-blue">Create an account</Link></>}>
    {!auth.configured && <StatusBanner type="warning" message="Cloud identity is not configured on this deployment. Local learning remains available." />}
    {auth.error && <StatusBanner type="error" message={auth.error} onClose={auth.clearError} />}
    <form onSubmit={submit} className="mt-5 space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
      <div className="flex items-center justify-between gap-4"><Link to="/auth/recover" className="text-xs font-semibold text-brand-blue">Forgot password?</Link><button disabled={!auth.configured || busy} className="btn-primary px-5 py-2.5 text-sm">{busy ? 'Signing in…' : 'Sign in'}</button></div>
    </form>
  </AuthShell>;
}

export function Field({ label, value, onChange, type = 'text', autoComplete, minLength, maxLength }) {
  const id = `auth-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return <label htmlFor={id} className="block text-sm font-semibold text-text-primary">{label}<input id={id} required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} className="input-base mt-2 w-full text-sm" /></label>;
}
