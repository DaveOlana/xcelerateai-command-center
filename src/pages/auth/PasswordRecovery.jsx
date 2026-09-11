import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import StatusBanner from '../../components/ui/StatusBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Field } from './Login.jsx';

export default function PasswordRecovery() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    try { await auth.requestPasswordRecovery(email.trim()); setSent(true); } catch { setSent(false); }
  };
  return <AuthShell eyebrow="Account recovery" title="Reset your password" description="Supabase will send a single-use recovery link to your email." footer={<Link to="/auth/login" className="font-semibold text-brand-blue">Return to sign in</Link>}>
    {sent && <StatusBanner type="success" message="If that account can be recovered, a reset email has been requested." />}
    {auth.error && <StatusBanner type="error" message={auth.error} onClose={auth.clearError} />}
    <form onSubmit={submit} className="mt-5 space-y-4"><Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" /><button disabled={!auth.configured} className="btn-primary w-full justify-center px-5 py-2.5 text-sm">Send recovery link</button></form>
  </AuthShell>;
}
