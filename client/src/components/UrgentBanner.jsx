import React from 'react';
import { AlertCircle, Bell, ShieldCheck } from 'lucide-react';

export default function UrgentBanner({ alerts = [], onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-900">Institutional Action Items</h4>
          <p className="text-xs text-amber-700 mt-0.5">
            {alerts[0]}
          </p>
        </div>
      </div>
      {alerts.length > 1 && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-200/60 text-amber-900">
          +{alerts.length - 1} more
        </span>
      )}
    </div>
  );
}
