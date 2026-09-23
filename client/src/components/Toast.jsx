import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 bg-white/95 border-slate-200 text-slate-800">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
      {isError && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
      {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
      {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-600 shrink-0" />}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}
