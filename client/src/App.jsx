import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

// Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';
import MobileBottomNav from './components/MobileBottomNav';
import OfflineReconnectionBanner from './components/OfflineReconnectionBanner';
import InstitutionalSettingsModal from './components/InstitutionalSettingsModal';
import RoleSwitcherModal from './components/RoleSwitcherModal';

// Views
import LoginView from './views/LoginView';
import PrincipalDashboard from './views/PrincipalDashboard';
import ClassTeacherDashboard from './views/ClassTeacherDashboard';
import AdmissionsHrDashboard from './views/AdmissionsHrDashboard';
import AccountantDashboard from './views/AccountantDashboard';
import CounsellorDashboard from './views/CounsellorDashboard';
import ParentDashboard from './views/ParentDashboard';
import VicePrincipalDashboard from './views/VicePrincipalDashboard';
import HodDashboard from './views/HodDashboard';
import SchoolMgmtDashboard from './views/SchoolMgmtDashboard';
import LibraryDashboard from './views/LibraryDashboard';
import ExamDashboard from './views/ExamDashboard';
import SportsDashboard from './views/SportsDashboard';
import TransportDashboard from './views/TransportDashboard';
import EventDashboard from './views/EventDashboard';

export default function App() {
  const { user, isAuthenticated, loading, showToast } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Global Command Palette Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to Server-Sent Events for real-time institutional notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = api.subscribeSSE(
      (evt) => {
        if (evt) {
          const text = evt.message || evt.data?.message || (evt.data?.title ? `${evt.data.title}: ${evt.data?.message || ''}` : null);
          if (text) {
            showToast(`[Live] ${text}`, 'info');
          }
        }
      },
      (err) => {
        // Silent reconnect in background
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-indigo-200 uppercase">
          Initializing Institutional Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <Toast />
      </>
    );
  }

  // Route to the appropriate view based on persona
  const renderDashboard = () => {
    switch (user?.role) {
      case 'principal':
        return <PrincipalDashboard />;
      case 'class_teacher':
      case 'faculty':
        return <ClassTeacherDashboard />;
      case 'admissions_officer':
        return <AdmissionsHrDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      case 'counsellor':
        return <CounsellorDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'vice_principal':
        return <VicePrincipalDashboard />;
      case 'hod':
        return <HodDashboard />;
      case 'school_mgmt':
        return <SchoolMgmtDashboard />;
      case 'librarian':
        return <LibraryDashboard />;
      case 'exam_controller':
        return <ExamDashboard />;
      case 'sports_coordinator':
        return <SportsDashboard />;
      case 'transport_coordinator':
        return <TransportDashboard />;
      case 'event_coordinator':
        return <EventDashboard />;
      default:
        return <PrincipalDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <OfflineReconnectionBanner />
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <main className="flex-1 pb-20 md:pb-6">
        {renderDashboard()}
      </main>
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white hidden md:block">
        <p>© 2026 CampusNoa. One Institution. One Intelligent Ecosystem. All rights reserved.</p>
      </footer>
      <Toast />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Institutional Settings Modal */}
      <InstitutionalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Institutional Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />

      {/* Touch-Friendly Native Bottom Navigation for Mobile Devices */}
      <MobileBottomNav 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />
    </div>
  );
}
