import React, { useState } from 'react';
import { 
  HeartHandshake, ShieldAlert, CheckCircle2, 
  MessageSquare, User, Clock, Plus, Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CounsellorDashboard() {
  const { showToast } = useAuth();
  const [cases, setCases] = useState([
    { id: 'c-01', studentName: 'Rohan Joshi', grade: 'Grade 9-A', reason: 'Chronic absenteeism and exam stress anxiety', severity: 'HIGH', status: 'ACTIVE_INTERVENTION', lastSession: '2026-03-18', notes: 'Scheduled 1-on-1 session with parents regarding study environment.' },
    { id: 'c-02', studentName: 'Aditya Patel', grade: 'Grade 9-A', reason: 'Peer conflict resolution and emotional regulation', severity: 'MEDIUM', status: 'MONITORING', lastSession: '2026-03-15', notes: 'Showed significant improvement in team sports and group study.' },
    { id: 'c-03', studentName: 'Kavya Nair', grade: 'Grade 9-A', reason: 'Career pathway guidance and aptitude assessment', severity: 'LOW', status: 'RESOLVED', lastSession: '2026-03-10', notes: 'Aptitude profile shared; interested in Computer Science and Design.' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    studentName: '',
    grade: 'Grade 9-A',
    reason: '',
    severity: 'MEDIUM',
    notes: '',
  });

  const handleCreateCase = (e) => {
    e.preventDefault();
    const created = {
      ...newCase,
      id: `c-0${cases.length + 1}`,
      status: 'ACTIVE_INTERVENTION',
      lastSession: new Date().toISOString().split('T')[0],
    };
    setCases([created, ...cases]);
    setIsModalOpen(false);
    showToast(`Confidential wellness case opened for ${newCase.studentName}`, 'success');
    setNewCase({ studentName: '', grade: 'Grade 9-A', reason: '', severity: 'MEDIUM', notes: '' });
  };

  const handleResolveCase = (caseId) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, status: 'RESOLVED' } : c));
    showToast('Case marked as successfully resolved.', 'success');
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
                  <div className="flex items-center gap-2">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
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
                  placeholder="e.g. Diya Kulkarni"
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
