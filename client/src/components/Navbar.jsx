import React, { useState } from 'react';
import { 
  Building2, ChevronDown, LogOut, UserCheck, Shield, GraduationCap, 
  Repeat, School, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcherModal from './RoleSwitcherModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  if (!user) return null;

  const roleNameMap = {
    principal: 'Principal',
    vice_principal: 'Vice Principal',
    hod: 'Head of Department',
    class_teacher: 'Class Teacher',
    admissions_officer: 'Admissions & Staffing',
    accountant: 'Finance & Accounts',
    counsellor: 'Student Counsellor',
    parent: 'Parent & Guardian',
    student: 'Student',
    school_mgmt: 'School Management',
  };

  const currentRoleLabel = roleNameMap[user.role] || user.role;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <School className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900">CAMPUSNOA</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden md:block">
                One Institution. One Intelligent Ecosystem.
              </p>
            </div>
          </div>

          {/* Right: Persona Switcher & User Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Role Switcher Pill */}
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 transition shadow-xs text-xs font-semibold max-w-[150px] sm:max-w-[220px] md:max-w-none"
              title="Click to switch institutional view"
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{currentRoleLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden lg:block text-left max-w-[120px] truncate">
                <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
}
