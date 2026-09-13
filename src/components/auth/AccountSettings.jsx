import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, LogOut, MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBanner from '../ui/StatusBanner.jsx';

export default function AccountSettings() {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState(auth.profile?.displayName || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => setDisplayName(auth.profile?.displayName || ''), [auth.profile]);

  const logout = async () => {
    setBusy(true); setMessage('');
    try { await auth.logout(); setMessage('Signed out. Local learning data was preserved.'); } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  };

  if (auth.loading) return <p className="text-sm text-text-muted">Checking cloud identity…</p>;
  if (auth.accessMode === 'offline-verified') return <div className="space-y-4"><StatusBanner type="warning" message="Offline learner access is active on this verified device. Local learning remains available; cloud profile features resume when connectivity returns." /><button type="button" disabled={busy} onClick={logout} className="btn-secondary gap-2 px-4 py-2 text-sm"><LogOut className="h-4 w-4" />End learner access on this device</button></div>;
  if (!auth.configured) return <StatusBanner type="warning" message="Cloud identity is not configured here. You may explore curricula, but a verified account is required to activate learner access." />;
  if (!auth.user) return <div className="rounded-2xl border border-border-default bg-bg-soft p-5"><p className="text-sm font-semibold text-text-primary">Guest access</p><p className="mt-1 text-xs leading-relaxed text-text-muted">Create or sign into a verified account to activate the full Learning OS. Existing bound local progress remains preserved and private.</p><div className="mt-4 flex gap-3"><Link to="/auth/login" className="btn-secondary px-4 py-2 text-sm">Sign in</Link><Link to="/auth/register" className="btn-primary px-4 py-2 text-sm">Create account</Link></div></div>;
  if (auth.ownershipConflict) return <div className="space-y-4"><StatusBanner type="warning" message="This browser's local learning record belongs to another verified account. It has not been exposed, deleted, merged, or reassigned." /><button type="button" disabled={busy} onClick={logout} className="btn-secondary gap-2 px-4 py-2 text-sm"><LogOut className="h-4 w-4" />Sign out and use the owning account</button></div>;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try { await auth.updateProfile(displayName.trim()); setMessage('Cloud profile updated.'); } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  };
  const resend = async () => {
    setBusy(true); setMessage('');
    try { await auth.resendVerification(auth.user.email); setMessage('Verification email requested.'); } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  };
  return <div className="space-y-4">
    {message && <StatusBanner type={message.includes('updated') || message.includes('requested') || message.includes('preserved') ? 'success' : 'error'} message={message} />}
    <div className="rounded-2xl border border-border-default bg-bg-soft p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-semibold text-text-primary"><Cloud className="h-4 w-4 text-brand-blue" />{auth.user.email}</p><p className="mt-1.5 text-xs text-text-muted">{auth.verified ? 'Verified cloud identity' : 'Email verification required for cloud profile features'}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${auth.verified ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-amber/10 text-brand-amber'}`}>{auth.verified ? 'Verified' : 'Pending'}</span></div>
      {!auth.verified && <button type="button" disabled={busy} onClick={resend} className="btn-secondary mt-4 gap-2 px-4 py-2 text-sm"><MailCheck className="h-4 w-4" />Resend verification</button>}
      {auth.verified && <form onSubmit={save} className="mt-5 border-t border-border-divider pt-5"><label htmlFor="cloud-display-name" className="text-sm font-semibold text-text-primary">Cloud display name</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="cloud-display-name" required maxLength="100" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="input-base min-w-0 flex-1 text-sm" /><button disabled={busy || auth.profileLoading} className="btn-primary justify-center px-4 py-2 text-sm">Save cloud profile</button></div></form>}
      <button type="button" disabled={busy} onClick={logout} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary"><LogOut className="h-4 w-4" />Sign out of cloud account</button>
    </div>
  </div>;
}
