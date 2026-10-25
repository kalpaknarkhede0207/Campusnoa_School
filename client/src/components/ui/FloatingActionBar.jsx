import React from 'react';
import { Check, X } from 'lucide-react';

export default function FloatingActionBar({
  selectedCount = 0,
  onClearSelection,
  children
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-800 ring-1 ring-white/10 text-xs font-semibold">
        {/* Selection Badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/80">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
            {selectedCount}
          </span>
          <span className="font-bold tracking-tight text-slate-200 whitespace-nowrap">
            {selectedCount === 1 ? '1 Record Selected' : `${selectedCount} Records Selected`}
          </span>
        </div>

        {/* Action Buttons Slot */}
        <div className="flex items-center gap-2">
          {children}
        </div>

        {/* Clear Selection Button */}
        {onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Deselect All"
            aria-label="Deselect all rows"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
