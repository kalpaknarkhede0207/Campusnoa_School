import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, ShieldAlert, CheckCircle2, 
  MessageSquare, User, Clock, Plus, Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CounsellorDashboard() {
  const { showToast } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    studentName: '',
    grade: 'Grade 9-A',
    reason: '',
    severity: 'MEDIUM',
    notes: '',
  });

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getCounsellingCases().catch(() => ({ cases: [] }));
      if (res?.cases && Array.isArray(res.cases)) {
        setCases(res.cases.map(c => ({
          id: c.caseId || c.id || `c-${Math.random()}`,
          studentName: c.studentName || c.name || 'Student',
          grade: c.gradeSection || c.grade || 'Grade 9-A',
          reason: c.category || c.reason || 'Wellbeing Referral',
          severity: c.severity || 'MEDIUM',
          status: c.status || 'ACTIVE_INTERVENTION',
          lastSession: c.sessionDate || c.date || new Date().toISOString().split('T')[0],
          notes: c.confidentialNotes || c.notes || 'Confidential session logged.'
        })));
      } else {
        setCases([]);
      }
    } catch (err) {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      await api.createCounsellingCase({
        studentName: newCase.studentName,
        category: newCase.reason || 'Wellbeing Referral',
        confidentialNotes: newCase.notes,
        actionPlan: 'Regular counseling scheduled.'
      });
      setIsModalOpen(false);
      showToast(`Confidential wellness case opened for ${newCase.studentName}`, 'success');
      setNewCase({ studentName: '', grade: 'Grade 9-A', reason: '', severity: 'MEDIUM', notes: '' });
      await loadCases();
    } catch (err) {
      showToast(err.message || 'Failed to open counselling case', 'error');
    }
  };

  const handleResolveCase = async (caseId) => {
    try {
      await api.resolveCounsellingCase(caseId, 'Successfully resolved with pastoral care team.');
      showToast('Case marked as successfully resolved in database.', 'success');
      await loadCases();
    } catch (err) {
      showToast(err.message || 'Failed to resolve case', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Wellness & Counselling</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Confidential Vault
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Strictly confidential behavioral health, mentorship escalations, and emotional wellbeing records
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Open New Case File
        </button>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="card-clean p-12 text-center">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No Confidential Counselling Cases</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            The wellness and pastoral care vault is live and clean. Click 'Open New Case File' to log a student consultation or wellness observation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c.id} className="card-clean p-5 hover:border-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    c.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.studentName[0]}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{c.studentName}</h3>
                      <span className="text-xs text-slate-500 font-medium">({c.grade})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.severity} PRIORITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{c.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                  {c.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolveCase(c.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                <span className="font-bold text-slate-800">Counsellor Clinical Notes:</span> {c.notes}
                <div className="mt-1 text-[11px] text-slate-400">Last Session Date: {c.lastSession}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Open Confidential Case File</h3>
            <p className="text-xs text-slate-500 mb-4">
              All notes are encrypted and restricted exclusively to authorized counselling personnel.
            </p>

            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Full Name"
                  value={newCase.studentName}
                  onChange={(e) => setNewCase({ ...newCase, studentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Concern / Referral Cause</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Academic stress, peer friction, anxiety"
                  value={newCase.reason}
                  onChange={(e) => setNewCase({ ...newCase, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confidential Session Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Clinical observations, background context, action plan..."
                  value={newCase.notes}
                  onChange={(e) => setNewCase({ ...newCase, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
                >
                  Save Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
