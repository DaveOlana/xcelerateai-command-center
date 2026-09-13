import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import StatusBanner from '../../components/ui/StatusBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Field } from './Login.jsx';

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmation: '' });
  const [localError, setLocalError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmation) return setLocalError('Passwords must match.');
    setLocalError('');
    setBusy(true);
    try {
      const data = await auth.signup(form.displayName.trim(), form.email.trim(), form.password);
      navigate(data.session ? '/settings#account' : '/auth/verify', { state: { email: form.email.trim() } });
    } catch {
      // AuthContext exposes the safe provider message.
    } finally {
      setBusy(false);
    }
  };

  return <AuthShell eyebrow="Account" title="Create your account" description="Add verified cloud identity without replacing anything already saved in this browser." footer={<>Already registered? <Link to="/auth/login" className="font-semibold text-brand-blue">Sign in</Link></>}>
    {(localError || auth.error) && <StatusBanner type="error" message={localError || auth.error} onClose={() => { setLocalError(''); auth.clearError(); }} />}
    <form onSubmit={submit} className="mt-5 space-y-4">
      <Field label="Display name" value={form.displayName} onChange={set('displayName')} autoComplete="name" maxLength={100} />
      <Field label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
      <Field label="Password" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" minLength={8} />
      <Field label="Confirm password" type="password" value={form.confirmation} onChange={set('confirmation')} autoComplete="new-password" minLength={8} />
      <button disabled={!auth.configured || busy} className="btn-primary w-full justify-center px-5 py-2.5 text-sm">{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
  </AuthShell>;
}
