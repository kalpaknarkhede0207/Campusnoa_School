import React, { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

// Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';

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

export default function App() {
  const { user, isAuthenticated, loading, showToast } = useAuth();

  // Listen to Server-Sent Events for real-time institutional notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = api.subscribeSSE(
      (evt) => {
        if (evt && evt.type && evt.message) {
          showToast(`[Live] ${evt.message}`, 'info');
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
      default:
        return <PrincipalDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {renderDashboard()}
      </main>
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
        <p>© 2026 CampusNoa. One Institution. One Intelligent Ecosystem. All rights reserved.</p>
      </footer>
      <Toast />
    </div>
  );
}
