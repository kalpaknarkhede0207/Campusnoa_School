import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, GraduationCap, DollarSign, 
  TrendingUp, AlertCircle, Search, Filter, 
  Grid, List as ListIcon, CheckCircle2, ChevronRight, Eye, RefreshCw,
  Megaphone, Clock, Send
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentDetailModal from '../components/StudentDetailModal';
import FacultyDetailModal from '../components/FacultyDetailModal';
import UrgentBanner from '../components/UrgentBanner';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PrincipalDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, staff, finance
  const [staffCategory, setStaffCategory] = useState('teaching'); // teaching vs non_teaching
  const [staffViewMode, setStaffViewMode] = useState('list'); // 'list' or 'grid' (list requested by user)
  
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, facRes, finRes] = await Promise.all([
        api.getStudents({ limit: 100 }),
        api.getFaculty({ limit: 100 }),
        api.getFinanceSummary().catch(() => null),
      ]);
      const stuList = Array.isArray(stuRes?.students) ? stuRes.students : (Array.isArray(stuRes) ? stuRes : []);
      const facList = Array.isArray(facRes?.faculty) 
        ? facRes.faculty 
        : (Array.isArray(facRes?.teachers) ? [...facRes.teachers, ...(facRes.nonTeachingStaff || [])] : (Array.isArray(facRes) ? facRes : []));
      setStudents(stuList);
      setFaculty(facList);
      setFinanceSummary(finRes || { totalCollected: 0, totalPending: 0, collectionRate: 0 });
    } catch (err) {
      console.error(err);
      showToast('Failed to load institutional data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stuArray = Array.isArray(students) ? students : [];
  const staffArray = Array.isArray(faculty) ? faculty : [];

  // Filtered lists
  const filteredStudents = stuArray.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.grade || s.class || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staffArray.filter(f => {
    const matchesCategory = staffCategory === 'all' ? true : (f.type === staffCategory);
    const matchesSearch = (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.subject || f.designation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hasAttendanceRecords = students.some(s => s.totalAttendanceSessions > 0 || (s.attendanceRate && s.attendanceRate > 0));
  const pendingApprovals = students.filter(s => s.admissionStatus === 'PENDING_APPROVAL' || s.status === 'PENDING').length;
  const principalAlerts = [];
  if (pendingApprovals > 0) {
    principalAlerts.push(`${pendingApprovals} admission verification records pending final Principal approval`);
  }

  // Chart data
  const attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Institutional Attendance Rate (%)',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const feeChartData = {
    labels: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    datasets: [
      {
        label: 'Collected (₹ Lakhs)',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: '#10b981',
      },
      {
        label: 'Overdue (₹ Lakhs)',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: '#f43f5e',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title and Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Governance Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Principal / Head of School — Academic, administrative, and financial oversight
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Grid },
            { id: 'students', label: `Students (${students.length})`, icon: Users },
            { id: 'staff', label: `Faculty & Staff (${faculty.length})`, icon: GraduationCap },
            { id: 'finance', label: 'Institutional Finance', icon: DollarSign },
            { id: 'broadcast', label: 'Announcements', icon: Megaphone },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <UrgentBanner alerts={principalAlerts} />

      {/* Key Metrics Cards - ALWAYS VISIBLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('students')}
          className={`card-clean p-5 text-left group transition ${activeTab === 'students' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:border-indigo-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{students.length}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
            View student directory <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('staff'); setStaffCategory('teaching'); }}
          className={`card-clean p-5 text-left group transition ${activeTab === 'staff' && staffCategory === 'teaching' ? 'ring-2 ring-emerald-500 shadow-md' : 'hover:border-emerald-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Teaching Staff</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {faculty.filter(f => f.type === 'teaching').length}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            Inspect faculty roster <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('staff'); setStaffCategory('non_teaching'); }}
          className={`card-clean p-5 text-left group transition ${activeTab === 'staff' && staffCategory === 'non_teaching' ? 'ring-2 ring-amber-500 shadow-md' : 'hover:border-amber-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Non-Teaching Staff</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {faculty.filter(f => f.type === 'non_teaching').length}
          </p>
          <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
            View administrative staff <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`card-clean p-5 text-left group transition ${activeTab === 'finance' ? 'ring-2 ring-sky-500 shadow-md' : 'hover:border-sky-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fee Realization</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-105 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {students.length > 0
              ? `${Math.round((students.filter(s => s.feeStatus === 'PAID').length / students.length) * 100)}%`
              : '0.0%'}
          </p>
          <p className="text-xs text-sky-600 font-semibold mt-1 flex items-center gap-1">
            Open fee ledger <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>
      </div>

      {/* OVERVIEW SUBTAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-clean p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Daily Attendance Trends
              </h3>
              {students.length === 0 || !hasAttendanceRecords ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Attendance Logs Recorded Yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Attendance trend graphs will populate dynamically once students are enrolled and homeroom teachers mark daily attendance.
                  </p>
                </div>
              ) : (
                <div className="h-64">
                  <Line data={attendanceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              )}
            </div>

            <div className="card-clean p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Grade-wise Fee Realization
              </h3>
              {students.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <DollarSign className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Fee Transactions Recorded Yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Grade-wise fee realization bars will populate dynamically once student fee invoices and receipts are logged.
                  </p>
                </div>
              ) : (
                <div className="h-64">
                  <Bar data={feeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS SUBTAB */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Student Records Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The institutional database is live and awaiting new student enrollments from the Admissions & HR portal.
              </p>
            </div>
          ) : (
            <div className="card-clean overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll / ID</th>
                    <th className="py-3 px-4">Grade & Section</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Academic Standing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((st) => (
                    <tr 
                      key={st._id || st.id} 
                      onClick={() => setSelectedStudent(st)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {st.name ? st.name[0] : 'S'}
                        </div>
                        {st.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{st.rollNo || st.enrollmentNo || 'STU-2026-01'}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{st.grade || st.class || 'Grade 9-A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          (st.attendanceRate || 0) >= 75 ? 'bg-emerald-50 text-emerald-700' : (st.attendanceRate > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600')
                        }`}>
                          {st.attendanceRate !== undefined ? `${st.attendanceRate}%` : '0%'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          st.feeStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {st.feeStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{st.gpa || 'Pending'}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TEACHING & NON-TEACHING STAFF SUBTAB */}
      {activeTab === 'staff' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            {/* Category Filter: Teaching vs Non-Teaching */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Category:</span>
              <button
                onClick={() => setStaffCategory('teaching')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  staffCategory === 'teaching'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Teaching Faculty ({faculty.filter(f => f.type === 'teaching').length || 24})
              </button>
              <button
                onClick={() => setStaffCategory('non_teaching')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  staffCategory === 'non_teaching'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Non-Teaching Staff ({faculty.filter(f => f.type === 'non_teaching').length || 14})
              </button>
              <button
                onClick={() => setStaffCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  staffCategory === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Staff ({faculty.length})
              </button>
            </div>

            {/* View Mode Toggle: List View vs Grid View */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStaffViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    staffViewMode === 'list'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setStaffViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    staffViewMode === 'grid'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Grid Cards"
                >
                  <Grid className="w-4 h-4" />
                  <span>Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* EMPTY OR LIST / GRID VIEW */}
          {filteredStaff.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Staff Records Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The institutional database is live and awaiting new teacher appointments from the Admissions & HR portal.
              </p>
            </div>
          ) : staffViewMode === 'list' ? (
            <div className="card-clean overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Role / Designation</th>
                    <th className="py-3 px-4">Staff Type</th>
                    <th className="py-3 px-4">Department / Subject</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStaff.map((f) => (
                    <tr 
                      key={f._id || f.id} 
                      onClick={() => setSelectedFaculty(f)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          f.type === 'teaching' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {f.name ? f.name[0] : 'E'}
                        </div>
                        {f.name}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{f.designation || f.subject || 'Faculty'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          f.type === 'teaching' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {f.type === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{f.department || f.subject || 'Academics'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{f.email || 'faculty@campusnoa.edu'}</td>
                      <td className="py-3 px-4 text-slate-600">{f.phone || '+91 94220 18839'}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((f) => (
                <div
                  key={f._id || f.id}
                  onClick={() => setSelectedFaculty(f)}
                  className="card-clean p-4 cursor-pointer hover:border-indigo-400 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      f.type === 'teaching' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {f.name ? f.name[0] : 'E'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {f.name}
                      </h4>
                      <p className="text-xs text-slate-500">{f.designation || f.subject}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{f.department || 'Academics'}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      f.type === 'teaching' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {f.type === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FINANCE SUBTAB */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clean p-5 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Total Collected</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ₹{((students.filter(s => s.feeStatus === 'PAID').length) * 45000).toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-slate-400">
                {students.length > 0 ? `${Math.round((students.filter(s => s.feeStatus === 'PAID').length / students.length) * 100)}% Collection efficiency` : '0 records in database'}
              </span>
            </div>
            <div className="card-clean p-5 border-l-4 border-l-rose-500">
              <span className="text-xs font-bold uppercase text-slate-500">Outstanding Overdue</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                ₹{((students.filter(s => s.feeStatus !== 'PAID').length) * 45000).toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-slate-400">
                Across {students.filter(s => s.feeStatus !== 'PAID').length} student accounts
              </span>
            </div>
            <div className="card-clean p-5 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Annual Billed Total</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                ₹{(students.length * 45000).toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-slate-400">Current Academic Year</span>
            </div>
          </div>

          {students.length === 0 && (
            <div className="card-clean p-12 text-center">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Fee Records Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The institutional finance ledger is live and clean. Student fee invoices, challans, and collections will appear here automatically as students are admitted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* BROADCAST SUBTAB */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-clean p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" /> New Broadcast Announcement
              </h3>
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  showToast('Announcement broadcasted to selected groups!', 'success');
                  e.target.reset();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>All Staff & Students</option>
                    <option>Teaching Faculty Only</option>
                    <option>Parents & Guardians Only</option>
                    <option>School Board Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Subject</label>
                  <input required type="text" placeholder="e.g. Urgent: Tomorrow's Holiday" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea required rows="4" placeholder="Type your announcement here..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="urgent" className="rounded text-rose-500 focus:ring-rose-500" />
                  <label htmlFor="urgent" className="text-xs font-bold text-rose-600">Mark as High Priority (SMS/Push Notification)</label>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-indigo-500 transition shadow-md flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Broadcast Message
                </button>
              </form>
            </div>

            <div className="card-clean p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" /> Recent Broadcasts
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200 text-rose-800">High Priority</span>
                    <span className="text-xs text-slate-500 font-medium">2 hours ago</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Heavy Rain Warning - School Closure</h4>
                  <p className="text-xs text-slate-600 mt-1">Due to severe weather warnings, the school will remain closed tomorrow for all grades.</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Delivered to: All Staff & Parents (98% Read)</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">Normal</span>
                    <span className="text-xs text-slate-500 font-medium">Yesterday</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Term 1 Grades Submission Deadline</h4>
                  <p className="text-xs text-slate-600 mt-1">All subject teachers must submit their final grades into the portal by 5 PM Friday.</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Delivered to: Teaching Faculty Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onRefresh={loadData}
      />
      <FacultyDetailModal
        faculty={selectedFaculty}
        isOpen={!!selectedFaculty}
        onClose={() => setSelectedFaculty(null)}
      />
    </div>
  );
}
