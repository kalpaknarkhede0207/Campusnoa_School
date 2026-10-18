import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, CreditCard, MessageSquare, 
  CalendarCheck, Award, Users, Settings, PlusCircle, CheckCircle2,
  User, KeyRound, Bus, Search, Repeat, FileCheck, GraduationCap, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav({ onOpenSettings, onOpenCommandPalette, onOpenRoleSwitcher }) {
  const { user } = useAuth();
  const [activeTabId, setActiveTabId] = useState('');

  useEffect(() => {
    if (user?.role === 'parent') {
      setActiveTabId('student');
    } else if (user?.role === 'class_teacher' || user?.role === 'faculty') {
      setActiveTabId('students');
    } else if (user?.role === 'vice_principal') {
      setActiveTabId('class_teacher_assign');
    } else if (user?.role === 'admissions_officer') {
      setActiveTabId('admissions');
    } else {
      setActiveTabId('overview');
    }
  }, [user?.role]);

  // Synchronize with dashboard tab change events
  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail?.tab) {
        setActiveTabId(e.detail.tab);
      } else if (e.detail?.subtab) {
        setActiveTabId(e.detail.subtab);
      }
    };
    window.addEventListener('campusnoa:tabChanged', handleTabChange);
    return () => window.removeEventListener('campusnoa:tabChanged', handleTabChange);
  }, []);

  if (!user) return null;

  const role = user.role;

  // Configure navigation buttons according to role
  const getNavItems = () => {
    if (role === 'parent') {
      return [
        { id: 'student', label: 'Academics', icon: User, tab: 'student' },
        { id: 'diary', label: 'Diary', icon: BookOpen, tab: 'diary' },
        { id: 'fees', label: 'Pay Fees', icon: CreditCard, tab: 'student', openFeeModal: true },
        { id: 'gatepass', label: 'Gate Pass', icon: KeyRound, tab: 'gatepass' },
        { id: 'inquiry', label: 'Inquire', icon: MessageSquare, tab: 'inquiry' },
      ];
    }

    if (role === 'class_teacher' || role === 'faculty') {
      return [
        { id: 'students', label: 'Attendance', icon: CalendarCheck, subtab: 'students' },
        { id: 'homework', label: 'Homework', icon: BookOpen, subtab: 'homework' },
        { id: 'exams', label: 'Results', icon: Award, subtab: 'exams' },
        { id: 'queries', label: 'Inquiries', icon: MessageSquare, subtab: 'queries' },
        { id: 'fees', label: 'Dues', icon: CreditCard, subtab: 'fees' },
      ];
    }

    if (role === 'principal') {
      return [
        { id: 'overview', label: 'Overview', icon: Home, tab: 'overview' },
        { id: 'approvals', label: 'Approvals', icon: FileCheck, tab: 'approvals' },
        { id: 'staff', label: 'Staff', icon: GraduationCap, tab: 'staff' },
        { id: 'finance', label: 'Finance', icon: CreditCard, tab: 'finance' },
        { id: 'search', label: 'Search', icon: Search, onClick: onOpenCommandPalette },
      ];
    }

    if (role === 'vice_principal') {
      return [
        { id: 'class_teacher_assign', label: 'Allocations', icon: UserCheck, tab: 'class_teacher_assign' },
        { id: 'proxies', label: 'Proxies', icon: CalendarCheck, tab: 'proxies' },
        { id: 'sanctions', label: 'Sanctions', icon: FileCheck, tab: 'sanctions' },
        { id: 'search', label: 'Search', icon: Search, onClick: onOpenCommandPalette },
        { id: 'roles', label: 'Roles', icon: Repeat, onClick: onOpenRoleSwitcher },
      ];
    }

    if (role === 'admissions_officer') {
      return [
        { id: 'admissions', label: 'Admissions', icon: User, tab: 'admissions' },
        { id: 'appointments', label: 'Faculty HR', icon: GraduationCap, tab: 'appointments' },
        { id: 'doc_locker', label: 'Doc Vault', icon: BookOpen, tab: 'doc_locker' },
        { id: 'search', label: 'Search', icon: Search, onClick: onOpenCommandPalette },
        { id: 'roles', label: 'Roles', icon: Repeat, onClick: onOpenRoleSwitcher },
      ];
    }

    // Default for School Management & Administrative Staff
    return [
      { id: 'overview', label: 'Overview', icon: Home, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      { id: 'search', label: 'Search', icon: Search, onClick: onOpenCommandPalette },
      { id: 'roles', label: 'Switch Role', icon: Repeat, onClick: onOpenRoleSwitcher },
      { id: 'settings', label: 'Settings', icon: Settings, onClick: onOpenSettings },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    setActiveTabId(item.id);
    window.dispatchEvent(new CustomEvent('campusnoa:switchTab', {
      detail: {
        tab: item.tab,
        subtab: item.subtab,
        openFeeModal: Boolean(item.openFeeModal)
      }
    }));
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTabId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-h-[44px] min-w-[50px] rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50/80 font-bold scale-102'
                  : 'text-slate-500 hover:text-indigo-600 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 stroke-[2.5]' : 'text-slate-500'}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-indigo-700' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
