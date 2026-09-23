import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getAuthToken, getRefreshToken, setAuthToken, setTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schoolMode, setSchoolMode] = useState('k12'); // 'k12' or 'higher_ed'
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev && prev.message === message ? null : prev));
    }, 4000);
  }, []);

  const loadSession = useCallback(async () => {
    const token = getAuthToken();
    const refToken = getRefreshToken();
    if (!token && !refToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      let session;
      try {
        session = await api.getSession();
      } catch (err) {
        if ((err.status === 401 || err.message === 'TOKEN_EXPIRED') && refToken) {
          const refreshRes = await api.refreshToken();
          if (refreshRes && refreshRes.user) {
            session = { user: refreshRes.user };
          } else {
            session = await api.getSession();
          }
        } else {
          throw err;
        }
      }

      if (session && session.user) {
        setUser(session.user);
        if (session.user.schoolMode) {
          setSchoolMode(session.user.schoolMode);
        }
      } else {
        setUser(null);
        setAuthToken(null);
      }
    } catch (err) {
      console.warn('Failed to load session:', err.message || err);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.user) {
        setUser(res.user);
        if (res.user.schoolMode) setSchoolMode(res.user.schoolMode);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setAuthToken(null);
      showToast('You have been signed out.', 'info');
    }
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await api.switchRole(targetRole);
      if (res.user) {
        setUser(res.user);
        showToast(`Switched active view to ${res.user.role.replace('_', ' ').toUpperCase()}`, 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.message || 'Failed to switch role', 'error');
      throw err;
    }
  };

  const updateSchoolMode = async (mode) => {
    try {
      await api.toggleSchoolMode(mode);
      setSchoolMode(mode);
      showToast(`Switched academic structure to ${mode === 'k12' ? 'K-12 School' : 'Higher Ed / University'}`, 'info');
    } catch (err) {
      setSchoolMode(mode); // fallback local
    }
  };

  const googleLogin = async (credential) => {
    try {
      // Direct fetch to our backend route
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential }),
      });
      const res = await response.json();
      
      if (!response.ok) throw new Error(res.message || 'Google Auth failed');
      
      if (res.user) {
        const accessToken = res.accessToken || res.token;
        const refreshToken = res.refreshToken;
        setTokens({ accessToken, refreshToken });
        setUser(res.user);
        if (res.user.schoolMode) setSchoolMode(res.user.schoolMode);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.message || 'Google Login failed', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        schoolMode,
        toast,
        showToast,
        login,
        googleLogin,
        logout,
        switchRole,
        updateSchoolMode,
        reloadSession: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
