import React from 'react';
import { 
  Home, BookOpen, CreditCard, ShieldAlert, MessageSquare, 
  CalendarCheck, Award, Users, Settings, PlusCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav({ onOpenSettings, onOpenCommandPalette }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Configure navigation buttons according to role
  const getNavItems = () => {
    if (role === 'parent') {
      return [
        { label: 'Overview', icon: Home, targetId: 'parent-overview' },
        { label: 'Diary', icon: BookOpen, targetId: 'parent-homework' },
        { label: 'Fees', icon: CreditCard, targetId: 'parent-fees' },
        { label: 'Gate Pass', icon: ShieldAlert, targetId: 'parent-gatepass' },
        { label: 'Inquire', icon: MessageSquare, targetId: 'parent-inquiries' },
      ];
    }

    if (role === 'class_teacher' || role === 'faculty') {
      return [
        { label: 'Roster', icon: Users, targetId: 'teacher-roster' },
        { label: 'Attendance', icon: CalendarCheck, targetId: 'teacher-attendance' },
        { label: 'Homework', icon: BookOpen, targetId: 'teacher-homework' },
        { label: 'Report Cards', icon: Award, targetId: 'teacher-grades' },
        { label: 'Inquiries', icon: MessageSquare, targetId: 'teacher-queries' },
      ];
    }

    // Default for Leadership & Administrative Staff
    return [
      { label: 'Home', icon: Home, targetId: 'admin-overview' },
      { label: 'Actions', icon: PlusCircle, onClick: onOpenCommandPalette },
      { label: 'Settings', icon: Settings, onClick: onOpenSettings },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (item.targetId) {
      const element = document.getElementById(item.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className="flex flex-col items-center justify-center py-1 px-2 min-h-[44px] min-w-[54px] rounded-xl text-slate-500 hover:text-indigo-600 active:scale-95 transition-all"
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
