import React from 'react';
import { Loader2 } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import GuestEntry from './GuestEntry.jsx';

export default function LearnerAccessGate({ children, fallback }) {
  const auth = useAuth();
  if (auth.loading || auth.accessMode === 'claiming') {
    return <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm font-semibold text-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Preparing secure learner access…</div>;
  }
  if (!auth.hasLearnerAccess) return fallback || <GuestEntry restricted />;
  return children || <Outlet />;
}
