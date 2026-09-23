import React, { useState } from 'react';
import { School, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginView() {
  const { login } = useAuth();
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
          <div className="flex flex-col items-center justify-center space-y-6">
            {error && (
              <div className="w-full p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium text-center">
                {error}
              </div>
            )}
            
            <p className="text-sm text-slate-300 text-center mb-2">
              Sign in securely using your institutional Google Workspace account.
            </p>

            <div className="w-full flex justify-center py-4">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setError('');
                  setLoading(true);
                  try {
                    await googleLogin(credentialResponse.credential);
                  } catch (err) {
                    setError('Google Authentication failed. Are you using an authorized account?');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Google Authentication was cancelled or failed.');
                }}
                useOneTap
                theme="filled_black"
                shape="pill"
              />
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
