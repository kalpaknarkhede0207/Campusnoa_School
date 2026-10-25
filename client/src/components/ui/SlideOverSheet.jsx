import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOverSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl' // e.g. max-w-lg, max-w-xl, max-w-2xl
}) {
  // Escape key listener to close sheet
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop with subtle blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div 
        className={`relative w-full ${width} bg-white shadow-2xl border-l border-slate-200/80 flex flex-col h-full z-10 animate-in slide-in-from-right duration-250 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Close inspector panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}
