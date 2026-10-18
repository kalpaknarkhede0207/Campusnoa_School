import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Command, ArrowRight, UserCheck, Shield, GraduationCap, 
  CreditCard, BookOpen, Clock, Settings, FileSpreadsheet, KeyRound,
  FileText, Users, X, Sparkles, CheckCircle2, ArrowUpDown, CornerDownLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette({ isOpen, onClose, onOpenSettings }) {
  const { user, switchRole, showToast } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Navigation & Roles
    { id: 'role-teacher', title: 'Switch to Class Teacher (Anjali Desai)', category: 'Personas', icon: GraduationCap, action: () => switchRole('class_teacher') },
    { id: 'role-parent', title: 'Switch to Parent (Vikram Sharma)', category: 'Personas', icon: Users, action: () => switchRole('parent') },
    { id: 'role-principal', title: 'Switch to Principal (Dr. Neha Bhatnagar)', category: 'Personas', icon: Shield, action: () => switchRole('principal') },
    { id: 'role-accountant', title: 'Switch to Accountant (Ramesh Iyer)', category: 'Personas', icon: CreditCard, action: () => switchRole('accountant') },
    { id: 'role-admissions', title: 'Switch to Admissions & HR (Priya Menon)', category: 'Personas', icon: UserCheck, action: () => switchRole('admissions_officer') },
    { id: 'role-exams', title: 'Switch to Exam Controller (Dr. Arvind Saxena)', category: 'Personas', icon: BookOpen, action: () => switchRole('exam_controller') },

    // Institutional Actions
    { id: 'act-settings', title: 'Institutional Settings & CBSE Scale', category: 'Actions', icon: Settings, action: () => { if (onOpenSettings) onOpenSettings(); } },
    { id: 'act-attendance', title: '1-Tap Homeroom Attendance ("The 15-Second Routine")', category: 'Actions', icon: UserCheck, action: async () => {
      await switchRole('class_teacher');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campusnoa:switchTab', { detail: { subtab: 'students' } }));
      }, 100);
    }},
    { id: 'act-homework', title: 'Assign Daily Homework Diary', category: 'Actions', icon: BookOpen, action: async () => {
      await switchRole('class_teacher');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campusnoa:switchTab', { detail: { subtab: 'homework' } }));
      }, 100);
    }},
    { id: 'act-gatepass', title: 'Generate Child Pick-up Gate Pass (OTP)', category: 'Actions', icon: KeyRound, action: async () => {
      await switchRole('parent');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campusnoa:switchTab', { detail: { tab: 'gatepass' } }));
      }, 100);
    }},
    { id: 'act-fee-ledger', title: 'Pay Dues / Tuition Fee Ledger', category: 'Actions', icon: CreditCard, action: async () => {
      await switchRole('parent');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campusnoa:switchTab', { detail: { tab: 'student', openFeeModal: true } }));
      }, 100);
    }},
    { id: 'act-approvals', title: 'Principal Approvals Desk (Sanctions & Events)', category: 'Actions', icon: Shield, action: async () => {
      await switchRole('principal');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campusnoa:switchTab', { detail: { tab: 'approvals' } }));
      }, 100);
    }},
    { id: 'act-admissions', title: 'Student Admissions Register', category: 'Actions', icon: UserCheck, action: async () => {
      await switchRole('admissions_officer');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campusnoa:switchTab', { detail: { tab: 'admissions' } }));
      }, 100);
    }},
  ];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search modules, or switch personas... (Esc to close)"
            className="w-full text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400 font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md border border-slate-200">
            ESC
          </kbd>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No institutional actions found matching "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    isSelected 
                      ? 'bg-indigo-50 text-indigo-950 font-semibold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs truncate">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 rounded-md">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Hint Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-sans font-semibold text-[10px] inline-flex items-center gap-0.5">
                <ArrowUpDown className="w-2.5 h-2.5" />
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-sans font-semibold text-[10px] inline-flex items-center gap-0.5">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-indigo-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> CampusNoa FastAction
          </span>
        </div>
      </div>
    </div>
  );
}
