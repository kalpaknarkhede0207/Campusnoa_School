import React, { useState } from 'react';
import { School, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginView() {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('principal@campusnoa.edu');
  const [password, setPassword] = useState('CampusNoa@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { role: 'School Management', email: 'board@campusnoa.edu', desc: 'Executive governance' },
    { role: 'Principal', email: 'principal@campusnoa.edu', desc: 'Full institutional governance' },
    { role: 'Class Teacher', email: 'teacher@campusnoa.edu', desc: 'Homeroom & fees' },
    { role: 'Admissions & HR', email: 'admissions@campusnoa.edu', desc: 'Admissions & teacher appointing' },
    { role: 'Accountant', email: 'accountant@campusnoa.edu', desc: 'Fee collections & dues' },
    { role: 'Parent', email: 'parent.arav@campusnoa.edu', desc: 'Student progress & live bus GPS' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">CAMPUSNOA</h2>
        <p className="mt-1 text-sm text-indigo-200">One Institution. One Intelligent Ecosystem.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Option 1: Google OAuth */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Fast Sign In
            </p>
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setError('');
                  setLoading(true);
                  try {
                    await googleLogin(credentialResponse.credential);
                  } catch (err) {
                    setError('Google Authentication failed. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Google Authentication was cancelled or failed.');
                }}
                theme="filled_black"
                shape="pill"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/80 px-3 text-slate-400 font-semibold tracking-wider rounded-md">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Option 2: Email & Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="name@campusnoa.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In with Credentials'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Fill Persona Helper */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs font-medium text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Quick-Fill Demo Roles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setEmail(item.email);
                    setPassword('CampusNoa@2026!');
                  }}
                  className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition group"
                >
                  <p className="text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                    {item.role}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Protected by Auth0 & MongoDB Institutional Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
