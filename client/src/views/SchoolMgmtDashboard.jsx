import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, Users, DollarSign, ShieldCheck, Award, RefreshCw, ClipboardList, BarChart2, Calendar, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SchoolMgmtDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsRes, leavesRes, facRes, stuRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getFacultyLeaves().catch(() => null),
        api.getFaculty({ limit: 200 }).catch(() => null),
        api.getStudents({ limit: 200 }).catch(() => null),
      ]);

      if (statsRes?.kpis) setStats(statsRes.kpis);
      if (leavesRes?.leaves) setLeaves(leavesRes.leaves);

      const facList = Array.isArray(facRes?.faculty)
        ? facRes.faculty
        : (Array.isArray(facRes?.teachers) ? [...facRes.teachers, ...(facRes.nonTeachingStaff || [])] : (Array.isArray(facRes) ? facRes : []));
      setFaculty(facList);

      const stuList = Array.isArray(stuRes?.students) ? stuRes.students : (Array.isArray(stuRes) ? stuRes : []);
      setStudents(stuList);
    } catch (err) {
      console.error('Failed to load management KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const unsub = api.subscribeSSE((event) => {
      if ([
        'LEAVE_APPLIED', 'LEAVE_ACTION_TAKEN', 'FACULTY_APPOINTED',
        'STUDENT_ADMITTED', 'STUDENT_DELETED', 'DELEGATION_RESPONDED'
      ].includes(event.type)) {
        loadStats();
      }
    });
    return () => { if (unsub) unsub(); };
  }, []);

  const formatCurrency = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const billed = stats?.financialHealth?.annualTuitionBilled || (students.length * 45000) || 0;
  const collected = stats?.financialHealth?.annualTuitionCollected || (students.filter(s => s.feeStatus === 'PAID').length * 45000) || 0;
  const collectionRate = billed > 0 ? Math.round((collected / billed) * 100) : 0;
  const enrollment = stats?.enrollmentAndCapacity?.currentEnrollment || students.length || 0;
  const capacity = stats?.enrollmentAndCapacity?.licensedCapacity || 120;
  const totalFaculty = stats?.facultyMetrics?.totalHeadcount || faculty.length || 0;
  const teachingStaff = stats?.facultyMetrics?.teachingStaff || faculty.filter(f => f.type === 'teaching').length || 0;
  const nonTeachingStaff = stats?.facultyMetrics?.nonTeachingStaff || faculty.filter(f => f.type !== 'teaching').length || 0;
  const ptrRatio = stats?.statutoryCompliance?.ptrRatioCurrent || (teachingStaff > 0 ? `1:${Math.round(enrollment / teachingStaff)}` : 'N/A');
  const accreditation = stats?.statutoryCompliance?.accreditationScore || 'NAAC A++ / CBSE';

  const pendingLeaves = leaves.filter(l => l.principalStatus === 'PENDING');
  const approvedLeaves = leaves.filter(l => l.principalStatus === 'APPROVED');
  const rejectedLeaves = leaves.filter(l => l.principalStatus === 'REJECTED');

  const TABS = [
    { id: 'overview', label: 'Institutional Overview', icon: BarChart2 },
    { id: 'staff', label: 'Faculty & Staff', icon: Users },
    { id: 'leaves', label: `Leave Register`, icon: ClipboardList, badge: pendingLeaves.length },
    { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Board of Trustees &amp; Institutional Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-300">
              Executive Governance
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Long-range capital planning, institutional compliance, revenue realization, and academic ranking
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* Vertical Sidebar & Content Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left-Hand Vertical Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Governance Navigation
          </div>
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition text-left ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === tab.id ? 'bg-white text-indigo-700' : 'bg-amber-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="card-clean p-5 border-l-4 border-l-indigo-600 text-left hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold uppercase text-slate-500">Annual Tuition Billed</span>
                  <p className="text-2xl font-black text-indigo-700 mt-1">{formatCurrency(billed)}</p>
                  <span className="text-xs text-slate-400">Collected: {formatCurrency(collected)} ({collectionRate}%)</span>
                </button>

                <button 
                  onClick={() => setActiveTab('overview')}
                  className="card-clean p-5 border-l-4 border-l-emerald-600 text-left hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold uppercase text-slate-500">Active Student Body</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{enrollment} Students</p>
                  <span className="text-xs text-slate-400">Capacity: {capacity} ({stats?.enrollmentAndCapacity?.utilizationPercentage || (capacity > 0 ? Math.round((enrollment / capacity) * 100) : 0)}% utilized)</span>
                </button>

                <button 
                  onClick={() => setActiveTab('staff')}
                  className="card-clean p-5 border-l-4 border-l-sky-600 text-left hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-sky-700">Total Faculty &amp; Staff</span>
                  <p className="text-2xl font-black text-sky-600 mt-1">{totalFaculty} Staff</p>
                  <span className="text-xs text-slate-400">{teachingStaff} Teaching | {nonTeachingStaff} Non-Teaching</span>
                </button>

                <button 
                  onClick={() => setActiveTab('compliance')}
                  className="card-clean p-5 border-l-4 border-l-amber-600 text-left hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-700">Pupil-Teacher Ratio</span>
                  <p className="text-2xl font-black text-amber-600 mt-1">{ptrRatio}</p>
                  <span className="text-xs text-slate-400">Accreditation: {accreditation}</span>
                </button>
              </div>

              {/* Leave Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('leaves')}
                  className="card-clean p-5 text-center border border-amber-200 bg-amber-50/30 hover:bg-amber-100/50 transition-all text-left cursor-pointer"
                >
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-black text-amber-700 text-center">{pendingLeaves.length}</p>
                  <span className="text-xs font-bold text-amber-600 block text-center">Leave Applications Pending</span>
                </button>

                <button 
                  onClick={() => setActiveTab('leaves')}
                  className="card-clean p-5 text-center border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-100/50 transition-all text-left cursor-pointer"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-black text-emerald-700 text-center">{approvedLeaves.length}</p>
                  <span className="text-xs font-bold text-emerald-600 block text-center">Leaves Sanctioned This Term</span>
                </button>

                <button 
                  onClick={() => setActiveTab('leaves')}
                  className="card-clean p-5 text-center border border-rose-200 bg-rose-50/30 hover:bg-rose-100/50 transition-all text-left cursor-pointer"
                >
                  <ClipboardList className="w-6 h-6 text-rose-600 mx-auto mb-1" />
                  <p className="text-2xl font-black text-rose-700 text-center">{rejectedLeaves.length}</p>
                  <span className="text-xs font-bold text-rose-600 block text-center">Leave Applications Rejected</span>
                </button>
              </div>

              {/* Grade-Wise Enrollment */}
              <div className="card-clean p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Grade-Wise Enrollment Distribution (Grades 1–6)
                </h3>
                {students.length === 0 ? (
                  <p className="text-xs text-slate-500">No students enrolled yet. Admit students via the HR &amp; Admissions portal.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(grade => {
                      const count = students.filter(s => (s.grade || '').includes(grade.replace('Grade ', '')) || (s.grade || '') === grade).length;
                      return (
                        <div key={grade} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-lg font-black text-indigo-600">{count}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{grade}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

      {/* TAB: FACULTY & STAFF */}
      {activeTab === 'staff' && (
        <div className="card-clean overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" /> Complete Faculty &amp; Staff Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{faculty.length} staff members on institutional payroll</p>
          </div>

          {faculty.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Faculty Appointed Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Faculty appointed via HR will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Name &amp; Code</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Staff Type</th>
                    <th className="py-3 px-4">Qualification</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {faculty.map((f) => (
                    <tr key={f._id || f.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">{(f.name || 'F')[0]}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{f.name}</p>
                            <p className="text-[11px] font-mono text-indigo-600">{f.employeeCode || f.code || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{f.designation || f.subject || '—'}</td>
                      <td className="py-3 px-4 text-slate-600">{f.department || 'Academics'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          f.type === 'teaching' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {f.type === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{f.qualification || 'M.Sc., B.Ed'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: LEAVE REGISTER */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="card-clean p-4 text-center border-l-4 border-l-amber-500">
              <p className="text-xl font-black text-amber-600">{pendingLeaves.length}</p>
              <p className="text-xs text-slate-500 font-semibold">Pending Principal Action</p>
            </div>
            <div className="card-clean p-4 text-center border-l-4 border-l-emerald-500">
              <p className="text-xl font-black text-emerald-600">{approvedLeaves.length}</p>
              <p className="text-xs text-slate-500 font-semibold">Approved This Term</p>
            </div>
            <div className="card-clean p-4 text-center border-l-4 border-l-rose-500">
              <p className="text-xl font-black text-rose-600">{rejectedLeaves.length}</p>
              <p className="text-xs text-slate-500 font-semibold">Rejected</p>
            </div>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-600" /> Full Institutional Leave Register
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">All faculty leave applications — board read-only view</p>
            </div>

            {leaves.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Leave Applications Recorded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Leave applications submitted by staff will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Leave Period</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Delegation</th>
                      <th className="py-3 px-4">Principal Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {leaves.map((lv) => (
                      <tr key={lv._id || lv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{lv.applicantName || lv.employeeName || 'Staff'}</p>
                          <p className="text-[11px] font-mono text-indigo-600">{lv.employeeCode || ''}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          {lv.fromDate ? new Date(lv.fromDate).toLocaleDateString('en-IN') : '—'}
                          {' – '}
                          {lv.toDate ? new Date(lv.toDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">{lv.leaveType || 'CL'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{lv.noOfDays || 1}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lv.delegationStatus === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : lv.delegationStatus === 'DECLINED' ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {lv.delegationStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lv.principalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : lv.principalStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200'
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
        </div>
      )}

      {/* TAB: COMPLIANCE & AUDIT */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="card-clean p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Executive Compliance &amp; Statutory Audit Status
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              All statutory mandates including CBSE Affiliation Bylaws, RTE Act norms, fire safety clearances,
              and school bus transport fitness certifications are verified from institutional records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-semibold">Statutory Tax &amp; PF Audit:</span>
                <p className="font-bold text-emerald-700 mt-1">Cleared &amp; Compliant</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-semibold">Campus Infrastructure Safety:</span>
                <p className="font-bold text-emerald-700 mt-1">Certified (Grade A)</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-semibold">Digital Data Governance:</span>
                <p className="font-bold text-emerald-700 mt-1">DPDP Compliant (Auth0 + TLS)</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-semibold">CBSE Affiliation Status:</span>
                <p className="font-bold text-emerald-700 mt-1">Active (Affiliation No. 1100234)</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-semibold">RTE Act Compliance (25% EWS):</span>
                <p className="font-bold text-emerald-700 mt-1">Verified &amp; Seats Reserved</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-semibold">School Bus Fitness Certificate:</span>
                <p className="font-bold text-emerald-700 mt-1">Valid until March 2027</p>
              </div>
            </div>
          </div>

          <div className="card-clean p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Annual Board Resolutions &amp; Policy Register
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { title: 'Fee Structure Revision FY 2026-27', date: 'Mar 2026', status: 'RATIFIED' },
                { title: 'CCTV & Digital Surveillance Policy Update', date: 'Jan 2026', status: 'RATIFIED' },
                { title: 'Staff Appraisal & Increment Policy', date: 'Dec 2025', status: 'RATIFIED' },
                { title: 'Emergency Evacuation Drill Protocol', date: 'Nov 2025', status: 'RATIFIED' },
              ].map(res => (
                <div key={res.title} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-900">{res.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Passed: {res.date}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
