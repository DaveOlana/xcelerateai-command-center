import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import StatusBanner from '../../components/ui/StatusBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Field } from './Login.jsx';

export default function VerificationPending() {
  const auth = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || auth.user?.email || '');
  const [sent, setSent] = useState(false);
  const resend = async (event) => {
    event.preventDefault();
    try { await auth.resendVerification(email.trim()); setSent(true); } catch { setSent(false); }
  };

  return <AuthShell eyebrow="Email verification" title={auth.verified ? 'Email verified' : 'Check your inbox'} description={auth.verified ? 'Your cloud identity is ready.' : 'Verification unlocks cloud profile features. You can continue learning locally while you wait.'} footer={<Link to={auth.verified ? '/settings#account' : '/'} className="font-semibold text-brand-blue">{auth.verified ? 'Open account settings' : 'Continue learning locally'}</Link>}>
    {sent && <StatusBanner type="success" message="Verification email requested. Check your inbox." />}
    {auth.error && <StatusBanner type="error" message={auth.error} onClose={auth.clearError} />}
    {!auth.verified && <form onSubmit={resend} className="mt-5 space-y-4"><Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" /><button disabled={!auth.configured} className="btn-secondary w-full justify-center px-5 py-2.5 text-sm">Resend verification email</button></form>}
  </AuthShell>;
}
