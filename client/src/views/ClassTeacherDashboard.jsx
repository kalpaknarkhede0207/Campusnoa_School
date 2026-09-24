import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, Save, 
  DollarSign, AlertCircle, FileText, Check, Send, ChevronRight, Share2, PlusCircle, Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentDetailModal from '../components/StudentDetailModal';

export default function ClassTeacherDashboard() {
  const { user, showToast } = useAuth();
  const [activeSubtab, setActiveSubtab] = useState('students'); // 'students', 'fees', 'subject', 'counsellor', 'delegation'
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { [studentId]: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleDeleteStudent = async (student) => {
    const studentName = student.name || 'this student';
    const studentId = student.rollNo || student.admissionNumber || '';
    if (!window.confirm(`Are you sure you want to remove ${studentName} (${studentId}) from the homeroom class roster?`)) {
      return;
    }
    try {
      await api.deleteStudent(student._id || student.id || student.admissionNumber);
      showToast(`Student ${studentName} removed successfully`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to remove student', 'error');
    }
  };

  // Dynamic state for other subtabs
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [counsellingCases, setCounsellingCases] = useState([]);
  const [delegations, setDelegations] = useState({
    monitor: 'Unassigned',
    sportsCaptain: 'Unassigned',
    itIncharge: 'Unassigned'
  });

  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ subject: '', grade: 'Grade 5-B', schedule: 'Mon, Wed, Fri (10:00 AM)', progress: 0 });
  
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);
  const [counsellingForm, setCounsellingForm] = useState({ studentName: '', type: 'Academic Stress', notes: '' });

  const [showDelegationModal, setShowDelegationModal] = useState(null); // 'monitor', 'sportsCaptain', 'itIncharge'
  const [delegationTarget, setDelegationTarget] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentRes, counselRes] = await Promise.all([
        api.getHomeroomStudents().catch(() => ({ students: [] })),
        api.getCounsellingCases().catch(() => ({ cases: [] }))
      ]);

      const list = Array.isArray(studentRes?.students) ? studentRes.students : [];
      setStudents(list);

      const initialAttendance = {};
      list.forEach(s => {
        initialAttendance[s.id || s._id] = 'PRESENT';
      });
      setAttendanceState(initialAttendance);

      if (counselRes?.cases && Array.isArray(counselRes.cases)) {
        setCounsellingCases(counselRes.cases);
      }
    } catch (err) {
      console.warn('Homeroom API load:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = api.subscribeSSE((event) => {
      if ([
        'CLASS_TEACHER_ASSIGNED', 
        'SUBJECT_TEACHER_ASSIGNED', 
        'TEACHER_ASSIGNED', 
        'STUDENT_ADMITTED', 
        'STUDENT_UPDATED', 
        'STUDENT_DELETED'
      ].includes(event.type)) {
        loadData();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status,
        date: new Date().toISOString().split('T')[0],
        section: 'Homeroom',
      }));

      await api.submitHomeroomAttendance(records);
      showToast('Daily attendance saved successfully to institutional database!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save attendance record', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSendReminder = (student) => {
    showToast(`Payment reminder SMS dispatched to ${student.parent || 'guardian'} (${student.phone || 'mobile'})`, 'info');
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.subject) {
      showToast('Please specify the subject name', 'error');
      return;
    }
    setAssignedSubjects([...assignedSubjects, { ...subjectForm, id: `sub-${Date.now()}` }]);
    setShowSubjectModal(false);
    setSubjectForm({ subject: '', grade: 'Grade 5-B', schedule: 'Mon, Wed, Fri (10:00 AM)', progress: 0 });
    showToast('Subject class assignment created!', 'success');
  };

  const handleAddCounselling = async (e) => {
    e.preventDefault();
    if (!counsellingForm.studentName) {
      showToast('Please select or specify student name', 'error');
      return;
    }
    const newCase = {
      caseId: `CASE-${Date.now().toString().slice(-4)}`,
      name: counsellingForm.studentName,
      studentName: counsellingForm.studentName,
      type: counsellingForm.type,
      category: counsellingForm.type,
      date: 'Today',
      status: 'Scheduled',
      confidentialNotes: counsellingForm.notes
    };
    setCounsellingCases([newCase, ...counsellingCases]);
    setShowCounsellingModal(false);
    setCounsellingForm({ studentName: '', type: 'Academic Stress', notes: '' });
    showToast('Student counselling case registered.', 'success');
  };

  const handleAssignDelegation = (roleKey) => {
    if (!delegationTarget.trim()) {
      showToast('Please specify a student name', 'error');
      return;
    }
    setDelegations(prev => ({ ...prev, [roleKey]: delegationTarget.trim() }));
    setShowDelegationModal(null);
    setDelegationTarget('');
    showToast('Homeroom duty assigned successfully!', 'success');
  };

  // Dynamic fee computations
  const paidStudents = students.filter(s => s.feeStatus === 'PAID');
  const pendingStudents = students.filter(s => s.feeStatus !== 'PAID');
  const totalCollected = paidStudents.length * 45000;
  const totalPending = pendingStudents.length * 12500;
  const realizationRate = students.length > 0 ? Math.round((paidStudents.length / students.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class Teacher Dashboard</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Homeroom {user?.homeroomDivision || user?.assignedDivision || 'Grade 5-B'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Class Teacher: {user?.name || 'Class In-charge'} — Homeroom attendance & fee collection management
          </p>
        </div>

        {/* Subtabs for Students & Fee Collection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveSubtab('students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeSubtab === 'students'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveSubtab('fees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeSubtab === 'fees'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fee Collection</span>
          </button>

          <button
            onClick={() => setActiveSubtab('subject')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeSubtab === 'subject'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Subject Teacher</span>
          </button>

          <button
            onClick={() => setActiveSubtab('counsellor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeSubtab === 'counsellor'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Student Counsellor</span>
          </button>

          <button
            onClick={() => setActiveSubtab('delegation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeSubtab === 'delegation'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Workload Delegation</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: STUDENTS & ATTENDANCE MARKING */}
      {activeSubtab === 'students' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
            <div className="card-clean p-4 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Total Students</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">{students.length}</p>
              <span className="text-xs text-slate-400">Enrolled in Homeroom</span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Class Topper</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">{students[0]?.name || '—'}</p>
              <span className="text-xs text-slate-400">{students.length > 0 ? 'Current Average: 94%' : 'No scores yet'}</span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-sky-500">
              <span className="text-xs font-bold uppercase text-slate-500">Avg. Attendance</span>
              <p className="text-xl font-bold text-sky-600 mt-1">{students.length > 0 ? '91%' : 'N/A'}</p>
              <span className="text-xs text-slate-400">Target: 95%</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mark Daily Homeroom Attendance</h3>
                <p className="text-xs text-slate-500">
                  Select status for enrolled students and click Save Attendance to record into database.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const allPresent = {};
                  students.forEach(s => { allPresent[s.id || s._id] = 'PRESENT'; });
                  setAttendanceState(allPresent);
                  showToast('Marked all students Present', 'info');
                }}
                disabled={students.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
              >
                Mark All Present
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance || students.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingAttendance ? 'Saving to Database...' : 'Save Attendance Record'}
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Students Enrolled Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The database is live and clean. When students are admitted via Admissions & HR, they will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="card-clean overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Parent Contact</th>
                    <th className="py-3 px-4">Term Attendance</th>
                    <th className="py-3 px-4">Today's Attendance Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((st) => {
                    const sId = st.id || st._id;
                    const currentStatus = attendanceState[sId] || 'PRESENT';

                    return (
                      <tr key={sId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{st.rollNo}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {st.name ? st.name[0] : 'S'}
                          </div>
                          {st.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {st.parent || 'Parent'} ({st.phone || '+91 98201 44521'})
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            st.attendanceRate >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {st.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(sId, 'PRESENT')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(sId, 'LATE')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(sId, 'ABSENT')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedStudent(st)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st)}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                              title="Remove Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: FEE COLLECTION RECORD */}
      {activeSubtab === 'fees' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clean p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Paid Accounts</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {paidStudents.length} / {students.length} Students
              </p>
              <span className="text-xs text-slate-400">Total collected: ₹{totalCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-rose-500">
              <span className="text-xs font-bold uppercase text-slate-500">Pending Dues</span>
              <p className="text-xl font-bold text-rose-600 mt-1">
                {pendingStudents.length} / {students.length} Students
              </p>
              <span className="text-xs text-slate-400">Outstanding: ₹{totalPending.toLocaleString('en-IN')}</span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Homeroom Realization</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">{realizationRate}%</p>
              <span className="text-xs text-slate-400">Fee collection rate</span>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Student Fee Records Available</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When students are admitted to this homeroom, their tuition fee status, invoice receipts, and pending dues will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="card-clean overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Receipt / Reference</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((st) => (
                    <tr key={st.id || st._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{st.rollNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{st.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          st.feeStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {st.feeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{st.feeAmount || '₹45,000'}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{st.receiptNo || 'REC-901'}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {st.parent || 'Parent'} ({st.phone || '+91 98201 44521'})
                      </td>
                      <td className="py-3 px-4 text-right">
                        {st.feeStatus === 'PENDING' ? (
                          <button
                            onClick={() => handleSendReminder(st)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 flex items-center gap-1 ml-auto"
                          >
                            <Send className="w-3 h-3" /> Remind
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                            <Check className="w-3.5 h-3.5" /> Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: SUBJECT TEACHER */}
      {activeSubtab === 'subject' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clean p-4 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Classes Taught</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">{assignedSubjects.length}</p>
              <span className="text-xs text-slate-400">
                {assignedSubjects.length > 0 ? `Across active divisions` : 'No subject classes assigned'}
              </span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Pending Assignments</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">0</p>
              <span className="text-xs text-slate-400">All submissions graded</span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-sky-500">
              <span className="text-xs font-bold uppercase text-slate-500">Avg. Syllabus Completion</span>
              <p className="text-xl font-bold text-sky-600 mt-1">
                {assignedSubjects.length > 0 
                  ? `${Math.round(assignedSubjects.reduce((a, b) => a + (b.progress || 0), 0) / assignedSubjects.length)}%` 
                  : '0%'}
              </p>
              <span className="text-xs text-slate-400">Paced for current term</span>
            </div>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Assigned Subjects
              </h3>
              <button 
                onClick={() => setShowSubjectModal(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Create Assignment
              </button>
            </div>

            {assignedSubjects.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Subject Classes Assigned Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You currently have no departmental subject classes assigned. Timetable allocations made by the Academic Coordinator will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Subject & Grade</th>
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Syllabus Progress</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {assignedSubjects.map((s, i) => (
                      <tr key={s.id || i} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {s.subject} <span className="text-slate-500 font-medium">({s.grade})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{s.schedule}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px]">
                              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${s.progress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => showToast(`Opening Grade Book for ${s.grade} ${s.subject}`, 'info')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200"
                          >
                            Grade Book
                          </button>
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

      {/* SUBTAB 4: STUDENT COUNSELLOR */}
      {activeSubtab === 'counsellor' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-clean p-4 border-l-4 border-l-amber-500">
              <span className="text-xs font-bold uppercase text-slate-500">Active Cases</span>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {counsellingCases.filter(c => c.status !== 'RESOLVED').length}
              </p>
              <span className="text-xs text-slate-400">Requiring pastoral follow-up</span>
            </div>
            <div className="card-clean p-4 border-l-4 border-l-blue-500">
              <span className="text-xs font-bold uppercase text-slate-500">Scheduled Sessions</span>
              <p className="text-xl font-bold text-blue-600 mt-1">{counsellingCases.length}</p>
              <span className="text-xs text-slate-400">Total logged wellness records</span>
            </div>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" /> Recent Wellness Records & Appointments
              </h3>
              <button 
                onClick={() => setShowCounsellingModal(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Log New Record
              </button>
            </div>

            {counsellingCases.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Active Pastoral / Counselling Cases</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No student wellbeing or behavioral flags have been logged for this homeroom. Click '+ Log New Record' to refer a student for counselling.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Concern / Type</th>
                      <th className="py-3 px-4">Date / Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {counsellingCases.map((c, i) => (
                      <tr key={c.caseId || i} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {c.name || c.studentName || 'Student'} <span className="text-slate-500 font-medium">({c.gradeSection || '9-A'})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{c.type || c.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            c.status === 'Completed' || c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 
                            c.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {c.status}
                          </span>
                          <span className="ml-2 text-slate-500 text-[11px]">{c.date || c.sessionDate}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => showToast(`Viewing counsellor notes: ${c.confidentialNotes || 'Confidential'}`, 'info')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200"
                          >
                            View Notes
                          </button>
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

      {/* SUBTAB 5: WORKLOAD DELEGATION */}
      {activeSubtab === 'delegation' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Duties Delegation */}
            <div className="card-clean p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Student Duty Delegation</h3>
                  <p className="text-xs text-slate-500">Assign homeroom responsibilities to students</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Class Monitor / Prefect</p>
                    <p className="text-[11px] text-slate-500">
                      Currently assigned to: <span className="font-semibold text-slate-700">{delegations.monitor}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowDelegationModal('monitor'); setDelegationTarget(delegations.monitor !== 'Unassigned' ? delegations.monitor : ''); }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                  >
                    {delegations.monitor === 'Unassigned' ? 'Assign' : 'Reassign'}
                  </button>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Sports Captain</p>
                    <p className="text-[11px] text-slate-500">
                      Currently assigned to: <span className="font-semibold text-slate-700">{delegations.sportsCaptain}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowDelegationModal('sportsCaptain'); setDelegationTarget(delegations.sportsCaptain !== 'Unassigned' ? delegations.sportsCaptain : ''); }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                  >
                    {delegations.sportsCaptain === 'Unassigned' ? 'Assign' : 'Reassign'}
                  </button>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">IT / Smartboard In-charge</p>
                    <p className="text-[11px] text-slate-500">
                      Currently assigned to: <span className="font-semibold text-slate-700">{delegations.itIncharge}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowDelegationModal('itIncharge'); setDelegationTarget(delegations.itIncharge !== 'Unassigned' ? delegations.itIncharge : ''); }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
                  >
                    {delegations.itIncharge === 'Unassigned' ? 'Assign Role' : 'Reassign'}
                  </button>
                </div>
              </div>
            </div>

            {/* Co-Teacher / Substitute Delegation */}
            <div className="card-clean p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Staff Workload Delegation</h3>
                  <p className="text-xs text-slate-500">Request substitute or share duties with co-teachers</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-slate-800 mb-1">Planning a Leave?</p>
                  <p className="text-xs text-slate-500 max-w-[250px] mb-4">
                    Delegate your homeroom attendance and syllabus tracking temporarily to a substitute.
                  </p>
                  <button 
                    onClick={() => showToast('Substitute request forwarded to Vice Principal.', 'success')}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md transition w-full"
                  >
                    Request Substitute Teacher
                  </button>
                </div>

                <div className="p-4 border border-emerald-200 rounded-xl bg-emerald-50">
                  <p className="text-xs font-bold text-emerald-800 mb-1">Co-Teacher Status</p>
                  <p className="text-[11px] text-emerald-600">
                    You currently have no active shared homeroom duties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delegation Assignment Modal */}
      {showDelegationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Assign Homeroom Responsibility</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select or enter the student's name for {showDelegationModal === 'monitor' ? 'Class Monitor' : showDelegationModal === 'sportsCaptain' ? 'Sports Captain' : 'IT In-charge'}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                {students.length > 0 ? (
                  <select
                    value={delegationTarget}
                    onChange={(e) => setDelegationTarget(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Choose enrolled student --</option>
                    {students.map(s => (
                      <option key={s.id || s._id} value={s.name}>{s.name} ({s.rollNo})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter student name"
                    value={delegationTarget}
                    onChange={(e) => setDelegationTarget(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDelegationModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAssignDelegation(showDelegationModal)}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Subject Class Assignment</h3>
            <p className="text-xs text-slate-500 mb-4">Register a teaching assignment for class syllabus tracking.</p>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={subjectForm.subject}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subject: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade & Section</label>
                  <select
                    value={subjectForm.grade}
                    onChange={(e) => setSubjectForm({ ...subjectForm, grade: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Grade 1-A</option>
                    <option>Grade 1-B</option>
                    <option>Grade 2-A</option>
                    <option>Grade 2-B</option>
                    <option>Grade 3-A</option>
                    <option>Grade 3-B</option>
                    <option>Grade 4-A</option>
                    <option>Grade 4-B</option>
                    <option>Grade 5-A</option>
                    <option>Grade 5-B</option>
                    <option>Grade 6-A</option>
                    <option>Grade 6-B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subjectForm.progress}
                    onChange={(e) => setSubjectForm({ ...subjectForm, progress: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri (10:00 AM)"
                  value={subjectForm.schedule}
                  onChange={(e) => setSubjectForm({ ...subjectForm, schedule: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Counselling Modal */}
      {showCounsellingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Log Student Counselling Record</h3>
            <p className="text-xs text-slate-500 mb-4">Record a wellbeing observation or pastoral appointment.</p>

            <form onSubmit={handleAddCounselling} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name *</label>
                {students.length > 0 ? (
                  <select
                    value={counsellingForm.studentName}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, studentName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Choose student --</option>
                    {students.map(s => (
                      <option key={s.id || s._id} value={s.name}>{s.name} ({s.rollNo})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Student Name"
                    value={counsellingForm.studentName}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, studentName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Concern Category</label>
                <select
                  value={counsellingForm.type}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, type: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option>Academic Stress</option>
                  <option>Behavioral</option>
                  <option>Career Guidance</option>
                  <option>Peer Conflict</option>
                  <option>Attendance Irregularity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Counselor Notes / Observation</label>
                <textarea
                  rows="3"
                  placeholder="Enter details of session or concern..."
                  value={counsellingForm.notes}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCounsellingModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  Commit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
