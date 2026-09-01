import React from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ConfirmAction({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
  isLoading = false,
  className = '',
  ...props
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-navy-950/90 border ${
        isDanger ? 'border-red-500/25' : 'border-brand-amber/25'
      } rounded-2xl p-5 space-y-4 transition-all duration-200 ease-out transform scale-100 translate-y-0 ${className}`}
      {...props}
    >
      <div className="flex gap-3 items-start">
        <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDanger ? 'text-red-400' : 'text-brand-amber'}`} />
        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
          {description && (
            <div className="text-[11px] text-slate-400 leading-normal">{description}</div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary text-[11px] font-bold uppercase tracking-wider py-2 px-4 select-none disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`${
            isDanger ? 'btn-danger' : 'btn-primary'
          } text-[11px] font-bold uppercase tracking-wider py-2 px-4 flex items-center gap-1.5 select-none`}
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
