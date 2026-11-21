import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

// Core SaaS Shell & Stability Components
import ErrorBoundary from './components/ErrorBoundary';
import AppShell from './components/layout/AppShell';
import DashboardSkeleton from './components/layout/DashboardSkeleton';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';
import InstitutionalSettingsModal from './components/InstitutionalSettingsModal';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import LoginView from './views/LoginView';

// Dynamic Code-Split Dashboard Views (Async Chunks)
const PrincipalDashboard = lazy(() => import('./views/PrincipalDashboard'));
const StudentDashboard = lazy(() => import('./views/StudentDashboard'));
const ClassTeacherDashboard = lazy(() => import('./views/ClassTeacherDashboard'));
const AdmissionsHrDashboard = lazy(() => import('./views/AdmissionsHrDashboard'));
const AccountantDashboard = lazy(() => import('./views/AccountantDashboard'));
const CounsellorDashboard = lazy(() => import('./views/CounsellorDashboard'));
const ParentDashboard = lazy(() => import('./views/ParentDashboard'));
const VicePrincipalDashboard = lazy(() => import('./views/VicePrincipalDashboard'));
const LibraryDashboard = lazy(() => import('./views/LibraryDashboard'));
const ExamDashboard = lazy(() => import('./views/ExamDashboard'));
const SportsDashboard = lazy(() => import('./views/SportsDashboard'));
const TransportDashboard = lazy(() => import('./views/TransportDashboard'));
const EventDashboard = lazy(() => import('./views/EventDashboard'));
const DigitalInformationBoard = lazy(() => import('./views/DigitalInformationBoard'));

export default function App() {
  const { user, isAuthenticated, loading, showToast } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [principalModule, setPrincipalModule] = useState('executive'); // executive, academics, admissions_staffing, finance, library, exams, sports, transport, events
  const [showKiosk, setShowKiosk] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/kiosk');
  });

  useEffect(() => {
    const handleSwitchModule = (e) => {
      if (e.detail?.module) {
        setPrincipalModule(e.detail.module);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('campusnoa:switchModule', handleSwitchModule);
    return () => window.removeEventListener('campusnoa:switchModule', handleSwitchModule);
  }, []);

  useEffect(() => {
    const handleKiosk = () => setShowKiosk(true);
    window.addEventListener('campusnoa:openKiosk', handleKiosk);
    return () => window.removeEventListener('campusnoa:openKiosk', handleKiosk);
  }, []);

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

  if (showKiosk) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <DigitalInformationBoard onExit={() => setShowKiosk(false)} />
        </Suspense>
        <Toast />
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginView />
        <Toast />
      </ErrorBoundary>
    );
  }

  // Route to the appropriate view based on persona
  const renderDashboard = () => {
    switch (user?.role) {
      case 'principal':
        switch (principalModule) {
          case 'executive':
            return <PrincipalDashboard />;
          case 'academics':
            return <VicePrincipalDashboard />;
          case 'admissions_staffing':
            return <AdmissionsHrDashboard />;
          case 'finance':
            return <AccountantDashboard />;
          case 'library':
            return <LibraryDashboard />;
          case 'exams':
            return <ExamDashboard />;
          case 'sports':
            return <SportsDashboard />;
          case 'transport':
            return <TransportDashboard />;
          case 'events':
            return <EventDashboard />;
          default:
            return <PrincipalDashboard />;
        }
      case 'student':
        return <StudentDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'class_teacher':
      case 'faculty':
        return <ClassTeacherDashboard />;
      case 'admissions_officer':
        return <AdmissionsHrDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      case 'counsellor':
        return <CounsellorDashboard />;
      case 'vice_principal':
        return <VicePrincipalDashboard />;
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
    <ErrorBoundary>
      <AppShell
        activePrincipalModule={principalModule}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      >
        <Suspense fallback={<DashboardSkeleton />}>
          {renderDashboard()}
        </Suspense>
      </AppShell>

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
    </ErrorBoundary>
  );
}
