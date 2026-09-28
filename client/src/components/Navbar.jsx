import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, ChevronDown, LogOut, UserCheck, Shield, GraduationCap, 
  Repeat, School, Sparkles, Bell, Check, X, Megaphone, FileCheck, Calendar, BookOpen, Settings, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInstitutional } from '../context/InstitutionalContext';
import RoleSwitcherModal from './RoleSwitcherModal';
import InstitutionalSettingsModal from './InstitutionalSettingsModal';

export default function Navbar() {
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
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Compute notifications for current user role
  const userNotifs = getNotificationsForUser(user.role);
  const unreadNotifs = userNotifs.filter(n => !readNotifications.includes(n.id));
  const unreadCount = unreadNotifs.length;
  const readCount = userNotifs.length - unreadCount;

  const getIcon = (type) => {
    switch (type) {
      case 'POLICY': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'ANNOUNCEMENT': return <Megaphone className="w-4 h-4 text-indigo-600" />;
      case 'APPROVAL_EXAM': return <FileCheck className="w-4 h-4 text-amber-600" />;
      case 'APPROVAL_EVENT': return <Calendar className="w-4 h-4 text-pink-600" />;
      case 'APPROVAL_BOOK': return <BookOpen className="w-4 h-4 text-teal-600" />;
      default: return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <School className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 truncate max-w-[140px] sm:max-w-xs">
                  {institutionalSettings?.institutionName || 'CAMPUSNOA'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  {institutionalSettings?.academicYear || 'v2.0'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden md:block">
                {institutionalSettings?.affiliationCode ? `Affiliated: ${institutionalSettings.affiliationCode}` : 'One Institution. One Intelligent Ecosystem.'}
              </p>
            </div>
          </div>

          {/* Right: Persona Switcher & User Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(prev => !prev)}
                className={`relative p-2 rounded-xl border transition flex items-center justify-center ${
                  unreadCount > 0 
                    ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                title="Institutional Notifications & Approvals"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
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
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsRead(userNotifs.map(n => n.id))}
                          className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> All read
                        </button>
                      )}
                      {readCount > 0 && (
                        <button
                          onClick={() => clearAllReadNotifications(userNotifs.filter(n => readNotifications.includes(n.id)).map(n => n.id))}
                          className="text-[10px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1"
                          title="Dismiss read notices"
                        >
                          <Trash2 className="w-3 h-3" /> Clear read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                    {userNotifs.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-medium">No institutional notices right now</p>
                      </div>
                    ) : (
                      userNotifs.map((n) => {
                        const isRead = readNotifications.includes(n.id);
                        return (
                          <div 
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50/80 transition cursor-pointer flex gap-3 items-start group relative ${
                              !isRead ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                              {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0 pr-5">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${n.badgeColor}`}>
                                  {n.source}
                                </span>
                                {!isRead && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{n.title}</h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Dismiss button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(n.id);
                              }}
                              className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition"
                              title="Dismiss notice"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Real-time synchronized across Board, Principal, &amp; Faculty desks
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Institutional Settings Gear Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-xs flex items-center justify-center"
              title="Institution Settings & Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>

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

      {/* Institutional Settings Modal */}
      <InstitutionalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
