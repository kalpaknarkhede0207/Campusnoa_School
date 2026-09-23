import React from 'react';
import { 
  X, Shield, GraduationCap, Users, UserCheck, 
  Briefcase, DollarSign, HeartHandshake, User, Building, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'school_mgmt', name: 'Board / School Management', desc: 'Executive governance & institutional analytics', icon: Building, color: 'text-slate-700 bg-slate-100 border-slate-300' },
  { id: 'principal', name: 'Principal / Head of School', desc: 'Overall academic & administrative authority', icon: Shield, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'vice_principal', name: 'Vice Principal / Coordinator', desc: 'Academic supervision & substitute allocation', icon: Award, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'hod', name: 'Head of Department (HOD)', desc: 'Curriculum syllabus & teacher coordination', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'class_teacher', name: 'Class Teacher', desc: 'Homeroom attendance, fee status & mentorship', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'admissions_officer', name: 'Admissions & Staffing Authority', desc: 'Student enrollment & teacher appointing authority', icon: Briefcase, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'accountant', name: 'Accountant / Finance Staff', desc: 'Fee collections, dues & ledger reconciliation', icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'parent', name: 'Parent & Guardian', desc: 'Student performance, fee receipts & live bus GPS', icon: Users, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
];

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { user, switchRole } = useAuth();
  if (!isOpen) return null;

  const handleSelectRole = async (roleId) => {
    try {
      await switchRole(roleId);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Switch Institutional Persona</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an institutional persona to preview authorization, dashboards, and privileges.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="p-6 overflow-y-auto space-y-2.5">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isCurrent = user?.role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${r.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
