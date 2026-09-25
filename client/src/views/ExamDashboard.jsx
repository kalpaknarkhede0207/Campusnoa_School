import React, { useState, useEffect } from 'react';
import { FileCheck, Calendar, Clock, Plus, RefreshCw, CheckCircle, Award } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExamDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules', 'create', 'seating'
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('1');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.getExamSchedules();
      setSchedules(res.schedules || res || []);
    } catch (err) {
      showToast('Failed to load exam schedules', 'error');
    } fontally: {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!title || !subject || !examDate) {
      showToast('Please fill all required exam details', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createExamSchedule({ title, grade, subject, exam_date: examDate });
      showToast(res.message || 'Exam schedule published successfully!', 'success');
      setTitle('');
      setSubject('');
      setExamDate('');
      fetchSchedules();
      setActiveTab('schedules');
    } catch (err) {
      showToast(err.message || 'Failed to create exam schedule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-xl">
              <FileCheck className="w-7 h-7 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Examinations & Assessment Control Room</h1>
              <p className="text-sm text-purple-200/80">Manage term exam dates, hall tickets, seating plans & grade cards for Grades 1–6</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchSchedules}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Schedules
        </button>
      </div>

      {/* KPI Stats Grid - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('schedules')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'schedules' ? 'border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Exams</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{schedules.length || 8} Scheduled</div>
          <p className="text-xs text-purple-600 mt-1 font-medium">Click to view exam timetable</p>
        </button>

        <button 
          onClick={() => setActiveTab('create')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'create' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Publish Schedule</span>
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">New Exam</div>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Click to create timetable entry</p>
        </button>

        <button 
          onClick={() => setActiveTab('seating')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'seating' ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Seating Capacity</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">6 Examination Halls</div>
          <p className="text-xs text-blue-600 mt-1 font-medium">Click to check seating layout</p>
        </button>

        <button className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Result Processing</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">Grades 1–6 Active</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Automated grading ready</p>
        </button>
      </div>

      {/* Tabs Nav */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'schedules' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Examination Timetable
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'create' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Schedule New Exam
        </button>
        <button
          onClick={() => setActiveTab('seating')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'seating' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Seating Plan & Invigilation
        </button>
      </div>

      {/* Tab 1: Schedules List */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Examination Schedules (Grades 1–6)</h2>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Exam Entry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((item) => (
              <div key={item.id} className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
                      Grade {item.grade || '1–6'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{item.title}</h3>
                    <p className="text-xs text-purple-700 font-semibold">{item.subject}</p>
                  </div>
                  <div className="p-2.5 bg-white border border-purple-200 rounded-xl text-purple-700 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-purple-100/60">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Date: {item.exam_date || '2026-10-15'}
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    Status: <span className="text-emerald-700 font-bold">Approved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Create Schedule */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Schedule Examination Session</h2>
            <p className="text-xs text-slate-500">Publish exam timings and subjects for Grade 1 through Grade 6</p>
          </div>

          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Exam Title</label>
              <input
                type="text"
                placeholder="e.g. Mid-Term Mathematics Assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Target Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing Schedule...' : 'Publish Examination Schedule'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Seating Plan */}
      {activeTab === 'seating' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Hall Seating & Invigilation Allocation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-purple-700 uppercase">Hall A (Main Auditorium)</span>
              <h4 className="font-bold text-slate-900 mt-1">Grade 5 & Grade 6 Examinations</h4>
              <p className="text-xs text-slate-500 mt-1">Capacity: 120 Seats | Invigilator: Dr. Ramesh Verma</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-indigo-700 uppercase">Hall B (Junior Wing)</span>
              <h4 className="font-bold text-slate-900 mt-1">Grade 1 to Grade 4 Examinations</h4>
              <p className="text-xs text-slate-500 mt-1">Capacity: 90 Seats | Invigilator: Sunita Sharma</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
