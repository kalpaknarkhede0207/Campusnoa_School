import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle2, TrendingUp, Award, Calendar, PlusCircle, ClipboardList, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function HodDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('curriculum');
  const [subjects, setSubjects] = useState([]);
  const [facultyLeaves, setFacultyLeaves] = useState([]);
  const [departmentFaculty, setDepartmentFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    progress: 75,
    target: 80
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditRes, leavesRes, facRes] = await Promise.all([
        api.getSyllabusAudit().catch(() => null),
        api.getFacultyLeaves().catch(() => null),
        api.getFaculty({ limit: 100 }).catch(() => null),
      ]);

      if (auditRes?.curriculumRecords) {
        setSubjects(auditRes.curriculumRecords.map(r => ({
          subject: r.subjectName,
          teacher: r.leadFacultyName,
          progress: r.syllabusCompletionPercent,
          target: r.targetPacePercent || 85,
          status: r.velocityStatus || 'ON_TRACK'
        })));
      }

      if (leavesRes?.leaves) {
        setFacultyLeaves(leavesRes.leaves);
      }

      const facList = Array.isArray(facRes?.faculty)
        ? facRes.faculty
        : (Array.isArray(facRes?.teachers) ? facRes.teachers : (Array.isArray(facRes) ? facRes : []));
      setDepartmentFaculty(facList);

    } catch (err) {
      console.error('HOD data load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = api.subscribeSSE((event) => {
      if ([
        'LEAVE_APPLIED', 'DELEGATION_RESPONDED', 'LEAVE_ACTION_TAKEN',
        'FACULTY_APPOINTED', 'FACULTY_UPDATED', 'SYLLABUS_UPDATED'
      ].includes(event.type)) {
        loadData();
      }
    });
    return () => { if (unsub) unsub(); };
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
    setSubjects(prev => [...prev, { subject: formData.subject, teacher: formData.teacher, progress: progressNum, target: targetNum, status }]);
    setShowAddModal(false);
    setFormData({ subject: '', teacher: '', progress: 75, target: 80 });
    showToast('Curriculum delivery track registered successfully!', 'success');
  };

  const avgProgress = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length)
    : 0;

  const facultyCount = new Set(subjects.map(s => s.teacher)).size;
  const pendingLeaves = facultyLeaves.filter(l => l.principalStatus === 'PENDING');
  const approvedLeaves = facultyLeaves.filter(l => l.principalStatus === 'APPROVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Head of Department (HOD) Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Department of Mathematics &amp; Science
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Curriculum tracking, syllabus delivery audits, and departmental faculty coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'curriculum' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Curriculum
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'leaves' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Staff &amp; Leaves
              {pendingLeaves.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">{pendingLeaves.length}</span>
              )}
            </button>
          </div>

          {activeTab === 'curriculum' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Add Track
            </button>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-clean p-5 border-l-4 border-l-blue-500">
          <span className="text-xs font-bold uppercase text-slate-500">Dept Faculty</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{departmentFaculty.length > 0 ? departmentFaculty.length : facultyCount} Staff</p>
          <span className="text-xs text-slate-400">Teaching & Non-Teaching</span>
        </div>
        <div className="card-clean p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500">Avg Syllabus</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{avgProgress}%</p>
          <span className="text-xs text-slate-400">Across active tracks</span>
        </div>
        <div className="card-clean p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-500">Leaves Pending</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingLeaves.length}</p>
          <span className="text-xs text-slate-400">Awaiting principal sanction</span>
        </div>
        <div className="card-clean p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500">Leaves Approved</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{approvedLeaves.length}</p>
          <span className="text-xs text-slate-400">This term</span>
        </div>
      </div>

      {/* TAB: CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="card-clean overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Delivery &amp; Lesson Plan Audits
            </h3>
            <span className="text-xs text-slate-500 font-medium">CBSE / State Board mapped</span>
          </div>

          {subjects.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Curriculum Tracks Registered Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Add subject curriculum tracks to track lesson plan pacing and syllabus progress.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                + Add First Track
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Subject &amp; Level</th>
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
      )}

      {/* TAB: STAFF & LEAVES */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Faculty Leave Applications */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" /> Department Staff Leave Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">All leave applications from departmental faculty — read-only HOD view</p>
            </div>

            {facultyLeaves.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Leave Applications Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Faculty leave applications will appear here once submitted by teaching staff.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Leave Period</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Delegation Status</th>
                      <th className="py-3 px-4">Principal Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {facultyLeaves.map((lv) => (
                      <tr key={lv._id || lv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{lv.applicantName || lv.employeeName || 'Staff'}</p>
                          <p className="text-[11px] text-slate-500">{lv.employeeCode || ''}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          {lv.fromDate ? new Date(lv.fromDate).toLocaleDateString('en-IN') : '—'}
                          {' – '}
                          {lv.toDate ? new Date(lv.toDate).toLocaleDateString('en-IN') : '—'}
                          <span className="block text-slate-400">{lv.noOfDays || 1} day(s)</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            {lv.leaveType || 'CL'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lv.delegationStatus === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lv.delegationStatus === 'DECLINED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {lv.delegationStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lv.principalStatus === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lv.principalStatus === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {lv.principalStatus || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Department Staff Roster */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Departmental Faculty Roster
              </h3>
            </div>

            {departmentFaculty.length === 0 ? (
              <div className="p-10 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No faculty records found. Faculty appointed via HR will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Subject / Role</th>
                      <th className="py-3 px-4">Employee Code</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {departmentFaculty.map((f) => (
                      <tr key={f._id || f.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {(f.name || 'F')[0]}
                            </div>
                            <span className="font-semibold text-slate-900">{f.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{f.subject || f.designation || '—'}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-600">{f.employeeCode || f.code || '—'}</td>
                        <td className="py-3 px-4 text-slate-600">{f.department || 'Academics'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Curriculum Track Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Department Curriculum Track</h3>
            <p className="text-xs text-slate-500 mb-4">Register a subject syllabus benchmark for delivery audit.</p>

            <form onSubmit={handleAddTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject &amp; Level *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Progress (%)</label>
                  <input type="number" min="0" max="100" value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Term Target (%)</label>
                  <input type="number" min="0" max="100" value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs">Add Track</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
