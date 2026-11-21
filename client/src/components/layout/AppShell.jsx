import React, { useState, useEffect, useRef } from 'react';
import { 
  School, PanelLeftClose, PanelLeft, Search, Command, Bell, Settings, 
  Repeat, LogOut, ChevronRight, Home, CalendarCheck, BookOpen, Award, 
  FileCheck, GraduationCap, FileText, CreditCard, KeyRound, Bus, Shield,
  Users, Check, X, Megaphone, Trash2, ShieldCheck, HeartHandshake, Briefcase, Trophy, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInstitutional } from '../../context/InstitutionalContext';
import MobileBottomNav from '../MobileBottomNav';
import OfflineReconnectionBanner from '../OfflineReconnectionBanner';

export default function AppShell({ 
  children, 
  onOpenCommandPalette, 
  onOpenSettings, 
  onOpenRoleSwitcher,
  activePrincipalModule = 'executive'
}) {
  const { user, logout } = useAuth();
  const { 
    getNotificationsForUser, 
    readNotifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    dismissNotification,
    clearAllReadNotifications,
    institutionalSettings 
  } = useInstitutional();

  // Sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('campusnoa:sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Keyboard shortcut Cmd+\ or Ctrl+\ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsCollapsed(prev => {
          const next = !prev;
          try {
            localStorage.setItem('campusnoa:sidebarCollapsed', String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss notification popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('campusnoa:sidebarCollapsed', String(next));
      } catch {}
      return next;
    });
  };

  if (!user) return null;

  const roleNameMap = {
    principal: 'Principal / Head of School',
    vice_principal: 'Vice Principal / Coordinator',
    class_teacher: 'Class Teacher',
    admissions_officer: 'Admissions & Staffing',
    accountant: 'Finance & Accounts',
    counsellor: 'Student Counsellor',
    parent: 'Parent & Guardian',
    student: 'Student',
    librarian: 'Librarian',
    exam_controller: 'Exam Controller',
    sports_coordinator: 'Sports Coordinator',
    transport_coordinator: 'Transport Coordinator',
    event_coordinator: 'Event Coordinator'
  };

  const currentRoleLabel = roleNameMap[user.role] || user.role;

  // Compute notifications for current user role
  const userNotifs = getNotificationsForUser(user.role);
  const unreadNotifs = userNotifs.filter(n => !readNotifications.includes(n.id));
  const unreadCount = unreadNotifs.length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'POLICY': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'ANNOUNCEMENT': return <Megaphone className="w-4 h-4 text-indigo-600" />;
      case 'APPROVAL_EXAM': return <FileCheck className="w-4 h-4 text-amber-600" />;
      case 'APPROVAL_EVENT': return <CalendarCheck className="w-4 h-4 text-pink-600" />;
      case 'APPROVAL_BOOK': return <BookOpen className="w-4 h-4 text-teal-600" />;
      default: return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  // Nav actions dispatching campusnoa:switchTab
  const handleNavClick = (tab, subtab) => {
    window.dispatchEvent(new CustomEvent('campusnoa:switchTab', {
      detail: { tab, subtab }
    }));
    setIsMobileMenuOpen(false);
  };

  // Principal Unified Module Switcher
  const handleModuleClick = (moduleKey, tab = null, subtab = null) => {
    window.dispatchEvent(new CustomEvent('campusnoa:switchModule', {
      detail: { module: moduleKey, tab, subtab }
    }));
    setIsMobileMenuOpen(false);
  };

  // Dynamic Role-Based Grouped Navigation Items (RBAC)
  const getRoleNavigationGroups = (role) => {
    switch (role) {
      case 'student':
        return [
          {
            title: 'Scholar Workspace',
            items: [
              { label: 'Daily Timetable', icon: CalendarCheck, onClick: () => handleNavClick('timetable', null) },
              { label: 'Homework & Class Diary', icon: BookOpen, onClick: () => handleNavClick('diary', null) },
              { label: 'Attendance & Gate Punch', icon: FileCheck, onClick: () => handleNavClick('attendance', null) },
            ]
          },
          {
            title: 'Assessments & Facilities',
            items: [
              { label: 'Exam Hall Ticket & Dates', icon: Award, onClick: () => handleNavClick('exams', null) },
              { label: 'Library Bookshelf', icon: BookOpen, onClick: () => handleNavClick('library', null) },
              { label: 'Cafeteria Nutritious Menu', icon: Sparkles, onClick: () => handleNavClick('canteen', null) },
              { label: 'Merit Awards & Certificates', icon: Trophy, onClick: () => handleNavClick('certificates', null) },
            ]
          }
        ];

      case 'parent':
        return [
          {
            title: 'Ward Workspace',
            items: [
              { label: 'Children Dossier', icon: Home, onClick: () => handleNavClick('student', null) },
              { label: 'Daily Diary & Homework', icon: BookOpen, onClick: () => handleNavClick('diary', null) },
              { label: 'Exam Report Cards', icon: Award, onClick: () => handleNavClick('student', 'exams') },
              { label: 'Attendance Record', icon: CalendarCheck, onClick: () => handleNavClick('student', 'attendance') },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Fee Payment & Receipts', icon: CreditCard, onClick: () => handleNavClick('student', 'fees') },
            ]
          },
          {
            title: 'Logistics & Safety',
            items: [
              { label: 'Gate Security Pass (QR/OTP)', icon: KeyRound, onClick: () => handleNavClick('gatepass', null) },
              { label: 'Bus Live Tracking (GPS)', icon: Bus, onClick: () => handleNavClick('bus', null) },
            ]
          }
        ];

      case 'class_teacher':
      case 'faculty':
        return [
          {
            title: 'Homeroom Workspace',
            items: [
              { label: 'Classroom Overview', icon: Home, onClick: () => handleNavClick(null, 'overview') },
              { label: 'Homeroom Attendance', icon: CalendarCheck, onClick: () => handleNavClick(null, 'students') },
              { label: 'Homework Diary & Presets', icon: BookOpen, onClick: () => handleNavClick('diary', 'homework') },
              { label: 'Marks & Assessments', icon: Award, onClick: () => handleNavClick(null, 'exams') },
              { label: 'Parent Messages & Inquiries', icon: Megaphone, onClick: () => handleNavClick(null, 'queries') },
            ]
          }
        ];

      case 'principal':
        return [
          {
            title: 'Executive & Governance',
            items: [
              { 
                label: 'Executive Desk & Approvals', 
                icon: Shield, 
                module: 'executive',
                isActive: activePrincipalModule === 'executive',
                onClick: () => handleModuleClick('executive') 
              },
              { 
                label: 'Academics & Timetables', 
                icon: GraduationCap, 
                module: 'academics',
                isActive: activePrincipalModule === 'academics',
                onClick: () => handleModuleClick('academics') 
              },
            ]
          },
          {
            title: 'Administration & Finance',
            items: [
              { 
                label: 'Admissions & Staffing Vault', 
                icon: Users, 
                module: 'admissions_staffing',
                isActive: activePrincipalModule === 'admissions_staffing',
                onClick: () => handleModuleClick('admissions_staffing') 
              },
              { 
                label: 'Finance & Fee Accounting', 
                icon: CreditCard, 
                module: 'finance',
                isActive: activePrincipalModule === 'finance',
                onClick: () => handleModuleClick('finance') 
              },
              { 
                label: 'Examinations & Assessments', 
                icon: Award, 
                module: 'exams',
                isActive: activePrincipalModule === 'exams',
                onClick: () => handleModuleClick('exams') 
              },
            ]
          },
          {
            title: 'Operations & Facilities',
            items: [
              { 
                label: 'Library & Learning Center', 
                icon: BookOpen, 
                module: 'library',
                isActive: activePrincipalModule === 'library',
                onClick: () => handleModuleClick('library') 
              },
              { 
                label: 'Sports & Physical Education', 
                icon: Trophy, 
                module: 'sports',
                isActive: activePrincipalModule === 'sports',
                onClick: () => handleModuleClick('sports') 
              },
              { 
                label: 'Fleet & Transport Logistics', 
                icon: Bus, 
                module: 'transport',
                isActive: activePrincipalModule === 'transport',
                onClick: () => handleModuleClick('transport') 
              },
              { 
                label: 'Events & Campus Calendar', 
                icon: CalendarCheck, 
                module: 'events',
                isActive: activePrincipalModule === 'events',
                onClick: () => handleModuleClick('events') 
              },
            ]
          },
          {
            title: 'Campus Display',
            items: [
              { 
                label: 'Digital Reception Kiosk', 
                icon: Sparkles, 
                module: 'digital_board',
                isActive: activePrincipalModule === 'digital_board',
                onClick: () => handleModuleClick('digital_board') 
              },
            ]
          }
        ];

      case 'vice_principal':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Academic Supervision', icon: Home, onClick: () => handleNavClick('overview', null) },
              { label: 'Class Attendance Logs', icon: CalendarCheck, onClick: () => handleNavClick(null, 'attendance') },
              { label: 'Curriculum & Homework', icon: BookOpen, onClick: () => handleNavClick(null, 'homework') },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Teacher Allocations', icon: GraduationCap, onClick: () => handleNavClick('class_teacher_assign', null) },
              { label: 'Faculty Proxies / Substitutions', icon: CalendarCheck, onClick: () => handleNavClick('proxies', null) },
              { label: 'Sanctions & Discipline', icon: FileCheck, onClick: () => handleNavClick('sanctions', null) },
            ]
          },
          {
            title: 'Logistics & Safety',
            items: [
              { label: 'Campus Gate Logs', icon: KeyRound, onClick: () => handleNavClick('gatepass', null) },
            ]
          }
        ];

      case 'accountant':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Financial Overview', icon: Home, onClick: () => handleNavClick('overview', null) },
              { label: 'Daily Fee Desk', icon: CreditCard, onClick: () => handleNavClick('collections', null) },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Student Fee Invoices', icon: FileText, onClick: () => handleNavClick('invoices', null) },
              { label: 'Defaulters & Reminders', icon: Megaphone, onClick: () => handleNavClick('defaulters', null) },
              { label: 'Bank Reconciliation & Ledgers', icon: FileCheck, onClick: () => handleNavClick('reconciliation', null) },
            ]
          }
        ];

      case 'admissions_officer':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Admissions Pipeline', icon: Home, onClick: () => handleNavClick('admissions', null) },
              { label: 'Inquiries Ledger', icon: Megaphone, onClick: () => handleNavClick('inquiries', null) },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Candidate Verification', icon: FileCheck, onClick: () => handleNavClick('verification', null) },
              { label: 'Document Locker / Vault', icon: FileText, onClick: () => handleNavClick('doc_locker', null) },
              { label: 'Faculty Appointing Authority', icon: GraduationCap, onClick: () => handleNavClick('appointments', null) },
            ]
          }
        ];

      case 'counsellor':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Wellness Console', icon: Home, onClick: () => handleNavClick('overview', null) },
              { label: 'Confidential Student Cases', icon: HeartHandshake, onClick: () => handleNavClick('cases', null) },
              { label: 'Pastoral Sessions', icon: CalendarCheck, onClick: () => handleNavClick('sessions', null) },
              { label: 'Behavioral & Attendance Alerts', icon: Shield, onClick: () => handleNavClick('alerts', null) },
            ]
          }
        ];

      case 'librarian':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Book Catalog', icon: BookOpen, onClick: () => handleNavClick('catalog', null) },
              { label: 'Issue & Return Desk', icon: FileCheck, onClick: () => handleNavClick('circulations', null) },
              { label: 'Active Borrowers', icon: Users, onClick: () => handleNavClick('borrowers', null) },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Book Procurement & Approvals', icon: FileText, onClick: () => handleNavClick('procurement', null) },
            ]
          }
        ];

      case 'exam_controller':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Timetables & Schedules', icon: CalendarCheck, onClick: () => handleNavClick('schedules', null) },
              { label: 'Seating Plans & Hall Tickets', icon: FileText, onClick: () => handleNavClick('seating', null) },
              { label: 'Marks Verification', icon: Award, onClick: () => handleNavClick('marks', null) },
              { label: 'Grade Transcripts', icon: FileCheck, onClick: () => handleNavClick('transcripts', null) },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Exam Approvals & Moderation', icon: ShieldCheck, onClick: () => handleNavClick('approvals', null) },
            ]
          }
        ];

      case 'sports_coordinator':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Sports Events & Meets', icon: Trophy, onClick: () => handleNavClick('events', null) },
              { label: 'Athletic Teams & Rosters', icon: Users, onClick: () => handleNavClick('teams', null) },
              { label: 'Equipment Inventory', icon: Briefcase, onClick: () => handleNavClick('inventory', null) },
            ]
          },
          {
            title: 'Logistics & Safety',
            items: [
              { label: 'Sports Grounds & First Aid', icon: ShieldCheck, onClick: () => handleNavClick('safety', null) },
            ]
          }
        ];

      case 'transport_coordinator':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Fleet & Vehicle Registry', icon: Bus, onClick: () => handleNavClick('fleet', null) },
              { label: 'Driver & Attendant Directory', icon: Users, onClick: () => handleNavClick('drivers', null) },
            ]
          },
          {
            title: 'Logistics & Safety',
            items: [
              { label: 'Route Dispatch & Live GPS', icon: Bus, onClick: () => handleNavClick('routes', null) },
              { label: 'Gate Security Pass Logs', icon: KeyRound, onClick: () => handleNavClick('gatepass', null) },
              { label: 'Emergency Alerts & SOS', icon: Shield, onClick: () => handleNavClick('sos', null) },
            ]
          }
        ];

      case 'event_coordinator':
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Events Calendar', icon: CalendarCheck, onClick: () => handleNavClick('calendar', null) },
              { label: 'Auditorium Bookings', icon: Home, onClick: () => handleNavClick('venues', null) },
              { label: 'Task Delegation', icon: Users, onClick: () => handleNavClick('tasks', null) },
            ]
          },
          {
            title: 'Administration',
            items: [
              { label: 'Event Budgets & Sanctions', icon: CreditCard, onClick: () => handleNavClick('sanctions', null) },
            ]
          }
        ];

      default:
        return [
          {
            title: 'Workspace',
            items: [
              { label: 'Overview', icon: Home, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            ]
          }
        ];
    }
  };

  const navigationGroups = getRoleNavigationGroups(user.role).filter(
    group => group.items && group.items.length > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      <OfflineReconnectionBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP COLLAPSIBLE SIDEBAR */}
        <aside 
          className={`hidden md:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-200 ease-in-out shrink-0 z-20 ${
            isCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Sidebar Header with Brand */}
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-3.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
                <School className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">
                    CampusNoa
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Enterprise ERP</p>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand Sidebar (Cmd + \\)' : 'Collapse Sidebar (Cmd + \\)'}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Sidebar Nav Links */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-none">
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {group.title}
                  </p>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = Boolean(item.isActive);
                  return (
                    <div key={item.label} className="relative group">
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        } ${
                          isCollapsed ? 'justify-center' : 'justify-start'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'
                        }`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </button>

                      {/* Tooltip on Collapsed Mode */}
                      {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Active Persona & Quick Role Switcher */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            <div className={`flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name ? user.name[0] : 'U'}
                </div>
                {!isCollapsed && (
                  <div className="truncate text-left">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-indigo-600 font-medium truncate">{currentRoleLabel}</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={onOpenRoleSwitcher}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer shrink-0"
                  title="Switch Persona Role"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN APPLICATION CONTAINER */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
          {/* TOP STICKY HEADER (56px) */}
          <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
            {/* Left: Mobile trigger & Institution Pill */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <PanelLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 tracking-tight">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {currentRoleLabel}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  Workspace
                </span>
              </div>
            </div>

            {/* Center: Command Palette Trigger (Cmd+K) */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-xs font-medium border border-slate-200/80 transition shadow-2xs max-w-xs cursor-pointer"
              title="Search or jump to module (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline truncate">Search modules, students, circulars...</span>
              <span className="sm:hidden text-xs">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white rounded-md border border-slate-200 shadow-2xs">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Right: Notifications, Settings, Persona */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Notification Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(prev => !prev)}
                  className={`relative p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                    unreadCount > 0 
                      ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100' 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Notifications & Sanctions"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Drawer */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-100 text-indigo-700">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => markAllNotificationsRead(user.role)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {userNotifs.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-medium">All caught up! No active notifications.</p>
                        </div>
                      ) : (
                        userNotifs.map((n) => {
                          const isRead = readNotifications.includes(n.id);
                          return (
                            <div 
                              key={n.id}
                              className={`p-3.5 flex items-start gap-3 transition ${
                                isRead ? 'bg-white opacity-70' : 'bg-indigo-50/20'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {getNotifIcon(n.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                                  {n.title}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => dismissNotification(n.id)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Institutional Settings */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Institutional Settings & Grading Standards"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Fast Switch Role Button */}
              <button
                type="button"
                onClick={onOpenRoleSwitcher}
                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Switch Role Persona"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Role</span>
              </button>
            </div>
          </header>

          {/* MAIN VIEWPORT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* ENTERPRISE FOOTER */}
          <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white hidden md:block">
            <p>© 2026 CampusNoa. One Institution. One Intelligent Ecosystem. All rights reserved.</p>
          </footer>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" />
                <span className="font-extrabold text-sm text-slate-900">CampusNoa</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {navigationGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase text-slate-400">{group.title}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          item.isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${item.isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* TOUCH-FRIENDLY BOTTOM NAVIGATION FOR MOBILE (< 768px) */}
      <MobileBottomNav 
        onOpenSettings={onOpenSettings}
        onOpenCommandPalette={onOpenCommandPalette}
        onOpenRoleSwitcher={onOpenRoleSwitcher}
      />
    </div>
  );
}
