import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Database, Loader2 } from 'lucide-react';

export default function DataGuard() {
  const { isBooting, isDataReady, hasImport } = useApp();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-50 bg-navy-950 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-navy-800/40 border border-navy-500/30 flex items-center justify-center mb-8 shadow-2xl relative">
          <div className="absolute inset-0 border-2 border-transparent border-t-accent-primary border-r-accent-cyan rounded-3xl animate-spin-slow opacity-60" />
          <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-10 h-10 object-contain" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-3">Booting System</h2>
        <p className="text-slate-400 text-[14px] flex items-center gap-2">
          Initializing XcelerateAI Command Center <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </p>
      </div>
    );
  }

  if (!hasImport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
          <Database className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Data Not Found</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Load your bootcamp JSON to activate this module.
        </p>
        <a href="/import" className="btn-primary mt-4">
          Go to Import
        </a>
      </div>
    );
  }

  if (!isDataReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <h2 className="text-xl font-bold text-white tracking-tight">Preparing Mission Data...</h2>
        <p className="text-slate-400 text-sm">Normalizing records.</p>
      </div>
    );
  }

  // Once everything is booted, imported, and ready:
  return <Outlet />;
}
