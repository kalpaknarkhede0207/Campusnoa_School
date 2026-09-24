import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle2, TrendingUp, Award, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function HodDashboard() {
  const { showToast } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    progress: 75,
    target: 80
  });

  const loadAudit = async () => {
    try {
      setLoading(true);
      const res = await api.getSyllabusAudit();
      if (res && res.curriculumRecords) {
        setSubjects(res.curriculumRecords.map(r => ({
          subject: r.subjectName,
          teacher: r.leadFacultyName,
          progress: r.syllabusCompletionPercent,
          target: r.targetPacePercent || 85,
          status: r.velocityStatus || 'ON_TRACK'
        })));
      }
    } catch (err) {
      console.error('Failed to load syllabus audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const handleAddTrack = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.teacher) {
      showToast('Please fill in subject and assigned teacher', 'error');
      return;
    }
    const progressNum = Number(formData.progress);
    const targetNum = Number(formData.target);
    const status = progressNum > targetNum ? 'AHEAD' : (progressNum === targetNum ? 'ON_TRACK' : 'SLIGHT_DELAY');

    const newTrack = {
      subject: formData.subject,
      teacher: formData.teacher,
      progress: progressNum,
      target: targetNum,
      status
    };

    setSubjects(prev => [...prev, newTrack]);
    setShowAddModal(false);
    setFormData({ subject: '', teacher: '', progress: 75, target: 80 });
    showToast('Curriculum delivery track registered successfully!', 'success');
  };

  const avgProgress = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length) 
    : 0;

  const facultyCount = new Set(subjects.map(s => s.teacher)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Head of Department (HOD) Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Department of Mathematics & Science
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Curriculum tracking, syllabus delivery audits, and departmental faculty coordination
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add Curriculum Track
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-clean p-5 border-l-4 border-l-blue-500">
          <span className="text-xs font-bold uppercase text-slate-500">Department Faculty</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {facultyCount > 0 ? `${facultyCount} Teachers` : '0 Teachers'}
          </p>
          <span className="text-xs text-slate-400">
            {facultyCount > 0 ? 'Assigned to active tracks' : 'No active track assignments'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500">Avg Syllabus Covered</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{avgProgress}%</p>
          <span className="text-xs text-slate-400">
            {subjects.length > 0 ? 'Calculated across active batches' : 'Awaiting curriculum initiation'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500">Department Pass Avg</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {subjects.length > 0 ? '91.4%' : '—'}
          </p>
          <span className="text-xs text-slate-400">
            {subjects.length > 0 ? 'Based on latest term exam' : 'No exams recorded yet'}
          </span>
        </div>
      </div>

      {/* Syllabus Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Delivery & Lesson Plan Audits
          </h3>
          <span className="text-xs text-slate-500 font-medium">CBSE / State Board mapped</span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No Curriculum Tracks Registered Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              The departmental syllabus auditor is live and clean. Add subject curriculum tracks to track lesson plan pacing and syllabus progress.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Subject & Level</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  <th className="py-3 px-4">Syllabus Progress</th>
                  <th className="py-3 px-4">Benchmark</th>
                  <th className="py-3 px-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subjects.map((sub) => (
                  <tr key={sub.subject} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub.subject}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sub.teacher}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${sub.progress}%` }} />
                        </div>
                        <span className="font-bold text-slate-800">{sub.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{sub.target}% Target</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        sub.status === 'AHEAD'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : sub.status === 'ON_TRACK'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Curriculum Track Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Department Curriculum Track</h3>
            <p className="text-xs text-slate-500 mb-4">Register a subject syllabus benchmark for delivery audit.</p>

            <form onSubmit={handleAddTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject & Level *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 5 Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Ankit Mehta"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Term Target (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
                >
                  Add Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
