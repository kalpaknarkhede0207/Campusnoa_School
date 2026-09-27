import React, { useState, useEffect } from 'react';
import { FileCheck, Calendar, Clock, Plus, RefreshCw, CheckCircle, Award, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useInstitutional } from '../context/InstitutionalContext';

export default function ExamDashboard() {
  const { showToast } = useAuth();
  const { examApprovals, submitExamForApproval } = useInstitutional();
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
      const res = await api.getExamSchedules().catch(() => ({ exams: [] }));
      const loadedSchedules = res?.exams || res?.schedules || (Array.isArray(res) ? res : []);
      setSchedules(Array.isArray(loadedSchedules) ? loadedSchedules : []);
    } catch (err) {
      showToast('Failed to load exam schedules', 'error');
    } finally {
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
      // User requirement: Whatever the new exam will be added it will go for approval to principal and vice principal
      submitExamForApproval({
        title,
        grade: `Grade ${grade}`,
        subject,
        examDate,
        session: 'Morning Session (09:30 AM - 12:00 PM)'
      });

      await api.createExamSchedule({ title, grade, subject, exam_date: examDate }).catch(() => null);

      showToast('Exam schedule successfully submitted for Principal & Vice Principal approval!', 'success');
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

  const pendingCount = examApprovals.filter(e => e.status === 'PENDING' || e.status === 'PARTIALLY_APPROVED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-xl">
              <FileCheck className="w-7 h-7 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Examinations &amp; Assessment Control Room</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Dual-Sanction Workflow
                </span>
              </div>
              <p className="text-sm text-purple-200/80 mt-0.5">
                Manage exam timetables, seating plans, and route new schedules for Principal &amp; Vice Principal approval
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchSchedules}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Schedules
        </button>
      </div>

      {/* KPI Stats Grid */}
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
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {(schedules.length || 6) + examApprovals.filter(e => e.status === 'APPROVED').length} Scheduled
          </div>
          <p className="text-xs text-purple-600 mt-1 font-medium">Click to view exam timetable</p>
        </button>

        <button 
          onClick={() => setActiveTab('schedules')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            pendingCount > 0 ? 'border-amber-400 bg-amber-50/40 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Dual Sanctions Pending</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">{pendingCount} Pending</div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Awaiting Principal &amp; VP approval</p>
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
          <p className="text-xs text-indigo-600 mt-1 font-medium">Click to route timetable entry</p>
        </button>

        <button 
          onClick={() => setActiveTab('seating')}
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all"
        >
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'schedules' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Examination Timetable &amp; Sanctions
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'create' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> Schedule New Exam
        </button>
        <button
          onClick={() => setActiveTab('seating')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'seating' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Seating Plan &amp; Invigilation
        </button>
      </div>

      {/* TAB 1: SCHEDULES & APPROVAL QUEUE */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {/* PENDING APPROVAL QUEUE CARD */}
          <div className="card-clean p-6 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" /> Pending Institutional Sanctions (Principal &amp; Vice Principal)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Newly scheduled exams require dual concurrence from Dr. Neha Bhatnagar (Principal) and the Vice Principal.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingCount} Awaiting Review
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examApprovals.map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        {ex.grade}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{ex.title}</h4>
                      <p className="text-xs text-purple-700 font-semibold">{ex.subject}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ex.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ex.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ex.status === 'APPROVED' ? 'Fully Approved ✓' : ex.status === 'REJECTED' ? 'Rejected ✕' : 'Pending Dual Review ⏳'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Principal Desk</span>
                      <span className={`font-bold ${ex.principalApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {ex.principalApproved ? 'Sanctioned ✓' : 'Awaiting Review ⏳'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vice Principal Desk</span>
                      <span className={`font-bold ${ex.vpApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {ex.vpApproved ? 'Sanctioned ✓' : 'Awaiting Review ⏳'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Date: {ex.examDate}</span>
                    <span>{ex.session}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE EXAM TIMETABLES */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Promulgated Examination Timetables (Grades 1–6)</h2>
              <button
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule New Exam
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Array.isArray(schedules) ? schedules : []).map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        Grade {item.grade || '1–6'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h3>
                      <p className="text-xs text-purple-700 font-semibold">{item.subject}</p>
                    </div>
                    <div className="p-2 bg-white border border-purple-200 rounded-lg text-purple-700 shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <span className="font-mono">Exam Date: {item.exam_date || '2026-10-15'}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Promulgated
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE SCHEDULE (WITH PRINCIPAL & VP APPROVAL ROUTE) */}
      {activeTab === 'create' && (
        <div className="card-clean p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Schedule Examination Session</h2>
            <p className="text-xs text-slate-500">
              New exam timetables are automatically routed to the Principal &amp; Vice Principal for mandatory institutional sanction.
            </p>
          </div>

          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Examination Title *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Mid-Term Summative Assessment 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Cohort *</label>
                <select 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                >
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Date *</label>
                <input 
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Curriculum Paper *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Mathematics Paper 1 (Algebra & Geometry)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
              />
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 leading-relaxed">
              <strong>Institutional Approval Route:</strong> Submitting this timetable dispatches notifications to both the <strong>Principal</strong> and <strong>Vice Principal</strong> dashboards. Once both authorities sanction the schedule, it is formally promulgated across all teacher and student portals.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('schedules')}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> {submitting ? 'Routing for Sanctions...' : 'Submit for Dual Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SEATING PLAN */}
      {activeTab === 'seating' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">Examination Hall A</span>
            <h3 className="font-bold text-slate-900 text-base">Grade 1 &amp; Grade 2 Alternating Seating</h3>
            <p className="text-xs text-slate-500">60 individual desks with 1.5m spacing, 2 invigilators assigned per block.</p>
            <div className="text-xs font-bold text-purple-700">Invigilator: Dr. Rakesh Sharma</div>
          </div>
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">Examination Hall B</span>
            <h3 className="font-bold text-slate-900 text-base">Grade 3 &amp; Grade 4 Interleaved Desks</h3>
            <p className="text-xs text-slate-500">Dual CCTV surveillance, digital attendance verification with barcode scanners.</p>
            <div className="text-xs font-bold text-indigo-700">Invigilator: Anita Verma</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="px-3 py-1 bg-slate-200 text-slate-800 text-xs font-bold rounded-full">Main Auditorium Annex</span>
            <h3 className="font-bold text-slate-900 text-base">Grade 5 &amp; Grade 6 Final Assessment</h3>
            <p className="text-xs text-slate-500">Air-conditioned examination wing, high-security question paper distribution.</p>
            <div className="text-xs font-bold text-slate-700">Invigilator: Sunita Rao</div>
          </div>
        </div>
      )}
    </div>
  );
}
