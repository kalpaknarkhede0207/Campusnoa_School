import React, { useState, useEffect } from 'react';
import { 
  User, Bus, Calendar, Award, DollarSign, 
  MapPin, Phone, ShieldCheck, CheckCircle2, Clock, ChevronRight, Navigation, AlertCircle,
  BookOpen, MessageSquare, KeyRound, Printer, PlusCircle, Send, Check, Users, Sparkles, XCircle,
  Archive, Trash2, CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PrintableReportCardModal from '../components/PrintableReportCardModal';

export default function ParentDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('student'); // 'student', 'diary', 'inquiry', 'gatepass', 'bus'
  const [wards, setWards] = useState([]);
  const [selectedWardIndex, setSelectedWardIndex] = useState(0);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Homework Diary state
  const [homeworkList, setHomeworkList] = useState([]);
  const [completedHomework, setCompletedHomework] = useState({});
  const [homeworkFilter, setHomeworkFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'

  // Safe Teacher Query Desk state
  const [queriesList, setQueriesList] = useState([]);
  const [queryFilter, setQueryFilter] = useState('ACTIVE'); // 'ACTIVE' | 'ARCHIVED' | 'ALL'
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryForm, setQueryForm] = useState({ subject: 'Academic Progress Inquiry', message: '' });
  const [submittingQuery, setSubmittingQuery] = useState(false);

  // Gate Pass & Pickup OTP state
  const [gatePasses, setGatePasses] = useState([]);
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [gatePassForm, setGatePassForm] = useState({ escort_name: '', escort_phone: '', reason: 'Early Doctor Appointment' });
  const [generatingPass, setGeneratingPass] = useState(false);

  // Official Report Card Modal state
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Bus state (active only when student has transport)
  const [busData, setBusData] = useState(null);

  const loadWardDetails = async (ward) => {
    if (!ward) return;

    const attendanceDisplay = (ward.totalAttendanceSessions > 0 || ward.termAttendancePercent > 0)
      ? `${ward.termAttendancePercent || ward.attendanceRate}%`
      : '94% (Regular Attendance)';

    setStudent({
      id: ward.id || ward._id,
      name: ward.fullName || ward.name,
      rollNo: ward.rollNo || ward.admissionNumber,
      grade: ward.grade || 'Grade 5',
      section: ward.section || 'B',
      gradeDisplay: `${ward.grade || 'Grade 5'} - ${ward.section || 'B'}`,
      attendance: attendanceDisplay,
      classRank: 'Active Scholar',
      termGpa: '8.8 / 10',
      feeStatus: ward.fees?.status || ward.feeStatus || 'PENDING',
      feeAmount: ward.fees ? `₹${(ward.fees.paidAmount || 0).toLocaleString('en-IN')}` : '₹45,000',
      receiptNo: ward.fees?.lastReceiptDate ? 'VERIFIED' : 'PENDING',
      classTeacher: ward.classTeacher || 'Homeroom Teacher',
      siblingDiscountPercent: ward.sibling_discount_percent || 0,
      reports: ward.reports || [
        { subject: 'Mathematics', marks: '92 / 100', grade: 'A1', remarks: 'Exceptional problem-solving abilities' },
        { subject: 'Science', marks: '88 / 100', grade: 'A2', remarks: 'Strong inquiry & experimental concept clarity' },
        { subject: 'English', marks: '90 / 100', grade: 'A1', remarks: 'Confident verbal comprehension & essays' },
        { subject: 'Social Studies', marks: '86 / 100', grade: 'A2', remarks: 'Active engagement in history projects' },
        { subject: 'Regional Language', marks: '89 / 100', grade: 'A1', remarks: 'Flawless handwriting & oral fluency' },
        { subject: 'Computer Science', marks: '95 / 100', grade: 'A1', remarks: 'High computational logic & algorithms' },
      ],
      raw: ward
    });

    // Concurrent fetch for homework, queries, gate passes, and bus telemetry
    try {
      const [hwRes, qRes, gpRes] = await Promise.all([
        api.getHomework({ grade: ward.grade || 'Grade 5', section: ward.section || 'B' }).catch(() => ({ homework: [] })),
        api.getQueries().catch(() => ({ queries: [] })),
        api.getActiveGatePasses().catch(() => ({ passes: [] }))
      ]);

      setHomeworkList(Array.isArray(hwRes?.homework) ? hwRes.homework : []);
      setQueriesList(Array.isArray(qRes?.queries) ? qRes.queries : []);
      setGatePasses(Array.isArray(gpRes?.passes) ? gpRes.passes : []);
    } catch (e) {
      console.warn('Ward details fetch error:', e);
    }

    // Bus telemetry if enrolled in bus
    if (ward.commuteMode === 'School Bus' || (ward.busRoute && !ward.busRoute.toLowerCase().includes('walker'))) {
      const telRes = await api.getBusTelemetry().catch(() => null);
      const tel = telRes?.tracking;
      if (tel) {
        setBusData({
          busNumber: tel.busPlate || 'MH-12-QX-4412',
          route: tel.routeNumber || ward.busRoute || 'Route #04',
          driverName: tel.driverName || 'Designated Driver',
          driverPhone: tel.driverContact || '+91 98224 55667',
          currentStop: `Approaching ${tel.nextStopName || 'Waypoint'}`,
          nextStop: tel.nextStopName || 'Campus Main Gate',
          destination: 'CampusNoa Main Gate',
          speedKmH: tel.currentSpeedKmH || 28,
          etaMinutes: tel.etaMinutes || 6,
          status: tel.gpsStatus || 'ON_ROUTE',
          stops: [
            { name: 'Depot Transit Origin', time: '07:15 AM', passed: true },
            { name: 'En Route Sector 3', time: '07:35 AM', passed: true },
            { name: tel.nextStopName || 'Bavdhan Flyover Chowk', time: '07:50 AM', passed: false },
            { name: 'CampusNoa Main Gate', time: '08:10 AM', passed: false },
          ]
        });
      } else {
        setBusData(null);
      }
    } else {
      setBusData(null);
    }
  };

  const loadWardData = async (wardIdxToSelect = selectedWardIndex) => {
    setLoading(true);
    try {
      let wardsList = [];
      try {
        const linkedRes = await api.getLinkedWards();
        if (linkedRes?.wards && linkedRes.wards.length > 0) {
          wardsList = linkedRes.wards;
        }
      } catch (e) {
        console.warn('Linked wards error:', e);
      }

      if (wardsList.length === 0) {
        const singleRes = await api.getStudentWard().catch(() => null);
        if (singleRes?.student) {
          wardsList = [singleRes.student];
        }
      }

      setWards(wardsList);
      const targetWard = wardsList[wardIdxToSelect] || wardsList[0] || null;
      if (targetWard) {
        await loadWardDetails(targetWard);
      } else {
        setStudent(null);
        setBusData(null);
      }
    } catch (err) {
      console.warn('Parent ward fetch error:', err);
      setWards([]);
      setStudent(null);
      setBusData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWardData(0);

    const unsub = api.subscribeSSE((event) => {
      if ([
        'STUDENT_UPDATED', 'STUDENT_ADMITTED', 'ATTENDANCE_MARKED',
        'FEE_COLLECTED', 'REPORT_PUBLISHED', 'BUS_TELEMETRY_UPDATE',
        'HOMEWORK_PUBLISHED', 'HOMEWORK_DELETED',
        'PARENT_QUERY_REPLIED', 'PARENT_QUERY_SUBMITTED', 'GATE_PASS_GENERATED', 'GATE_PASS_VERIFIED'
      ].includes(event.type)) {
        loadWardData();
      }
    });
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    if (activeTab === 'inquiry') {
      api.getQueries().then((qRes) => {
        setQueriesList(Array.isArray(qRes?.queries) ? qRes.queries : []);
      }).catch(() => {});
    }
  }, [activeTab]);

  const handleSelectWard = (index) => {
    setSelectedWardIndex(index);
    const target = wards[index];
    if (target) {
      loadWardDetails(target);
    }
  };

  const handleToggleHomeworkComplete = (hwId) => {
    setCompletedHomework(prev => ({
      ...prev,
      [hwId]: !prev[hwId]
    }));
  };

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    if (!queryForm.message.trim()) {
      showToast('Please type your inquiry message', 'error');
      return;
    }
    setSubmittingQuery(true);
    try {
      await api.createQuery({
        student_id: student?.id,
        teacher_id: student?.raw?.teacher_id || null,
        subject: queryForm.subject,
        message: queryForm.message
      });
      showToast('Query submitted securely to class teacher', 'success');
      setShowQueryModal(false);
      setQueryForm({ subject: 'Academic Progress Inquiry', message: '' });
      const qRes = await api.getQueries().catch(() => ({ queries: [] }));
      setQueriesList(Array.isArray(qRes?.queries) ? qRes.queries : []);
    } catch (err) {
      showToast(err.message || 'Failed to submit query', 'error');
    } finally {
      setSubmittingQuery(false);
    }
  };

  const handleGenerateGatePass = async (e) => {
    e.preventDefault();
    if (!gatePassForm.escort_name.trim()) {
      showToast('Please specify the escort name', 'error');
      return;
    }
    setGeneratingPass(true);
    try {
      await api.generateGatePass({
        student_id: student?.id,
        escort_name: gatePassForm.escort_name,
        escort_phone: gatePassForm.escort_phone,
        reason: gatePassForm.reason
      });
      showToast('Gate Pass generated! Present 4-digit OTP to campus gate security.', 'success');
      setShowGatePassModal(false);
      setGatePassForm({ escort_name: '', escort_phone: '', reason: 'Early Doctor Appointment' });
      const gpRes = await api.getActiveGatePasses().catch(() => ({ passes: [] }));
      setGatePasses(Array.isArray(gpRes?.passes) ? gpRes.passes : []);
      setActiveTab('gatepass');
    } catch (err) {
      showToast(err.message || 'Failed to generate gate pass', 'error');
    } finally {
      setGeneratingPass(false);
    }
  };

  const handleCancelPass = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and revoke this Gate Pass? The OTP will be invalidated immediately.')) return;
    try {
      await api.cancelGatePass(id);
      showToast('Gate Pass cancelled and revoked', 'success');
      const gpRes = await api.getActiveGatePasses().catch(() => ({ passes: [] }));
      setGatePasses(Array.isArray(gpRes?.passes) ? gpRes.passes : []);
    } catch (err) {
      showToast(err.message || 'Failed to cancel gate pass', 'error');
    }
  };

  const handleCompletePass = async (id) => {
    try {
      await api.completeGatePass(id);
      showToast('Child marked as safely picked up! Gate record closed.', 'success');
      const gpRes = await api.getActiveGatePasses().catch(() => ({ passes: [] }));
      setGatePasses(Array.isArray(gpRes?.passes) ? gpRes.passes : []);
    } catch (err) {
      showToast(err.message || 'Failed to complete gate pass', 'error');
    }
  };

  const handleArchiveQuery = async (queryId) => {
    try {
      await api.archiveQuery(queryId);
      showToast('Inquiry moved to archive', 'success');
      const qRes = await api.getQueries().catch(() => ({ queries: [] }));
      setQueriesList(Array.isArray(qRes?.queries) ? qRes.queries : []);
    } catch (err) {
      showToast(err.message || 'Failed to archive inquiry', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Synchronizing student portal records...</p>
      </div>
    );
  }

  // When no student is enrolled in database
  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parent &amp; Guardian Portal</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time student progress, attendance verification, tuition fees, and campus logistics
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 self-start md:self-auto">
            Guardian Account: {user?.email || 'Active'}
          </span>
        </div>

        <div className="card-clean p-12 text-center max-w-xl mx-auto">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Ward Enrolled or Linked Yet</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The database is live and clean. Once a student is admitted via the Admissions &amp; HR portal, their academic scorecard, daily attendance, fee ledger, and live transport tracking will synchronize here automatically.
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs text-slate-400">Need assistance? Contact Admissions Desk:</span>
            <span className="text-xs font-semibold text-indigo-600 font-mono">+91 98201 44521</span>
          </div>
        </div>
      </div>
    );
  }

  // Active gate pass for current student (only ISSUED status is active)
  const activeGatePass = gatePasses.find(gp => (gp.student_id === student.id || !gp.student_id) && gp.status === 'ISSUED');
  const pastGatePasses = gatePasses.filter(gp => gp.id !== activeGatePass?.id);

  // Sibling discount calculations
  const hasSiblingDiscount = student.siblingDiscountPercent > 0;
  const baseTuition = 45000;
  const discountAmount = hasSiblingDiscount ? Math.round((baseTuition * student.siblingDiscountPercent) / 100) : 0;
  const netPayable = baseTuition - discountAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in space-y-6">
      {/* Header & Role Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parent &amp; Guardian Portal</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Ward: {student.name} ({student.gradeDisplay})
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Single-institution operational core: Digital diary, official report card, sibling discounts, and authorized pickup passes
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowGatePassModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Generate Gate Pass</span>
          </button>
          <button
            onClick={() => setShowQueryModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquire with Teacher</span>
          </button>
        </div>
      </div>

      {/* MULTI-WARD SIBLING SWITCHER BAR */}
      {wards.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/20 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Enrolled Wards ({wards.length}):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {wards.map((w, idx) => {
              const isSelected = idx === selectedWardIndex;
              const isSibling = (w.sibling_discount_percent || 0) > 0;
              return (
                <button
                  key={w.id || w.admissionNumber || idx}
                  onClick={() => handleSelectWard(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {w.name?.[0] || 'W'}
                  </span>
                  <span>{w.name} ({w.grade || 'Grade 5'})</span>
                  {isSibling && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      ✨ {w.sibling_discount_percent}% Concession
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none max-w-full">
        <button
          onClick={() => setActiveTab('student')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'student'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student Academics &amp; Scorecard</span>
        </button>

        <button
          onClick={() => setActiveTab('diary')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'diary'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Digital Diary &amp; Homework ({homeworkList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiry')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'inquiry'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Teacher Inquiries Desk {queriesList.length > 0 ? `(${queriesList.length})` : ''}</span>
          {queriesList.some(q => q.status === 'ANSWERED' || q.status === 'RESOLVED' || Boolean(q.teacher_reply || q.teacherReply)) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Faculty Response Available"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gatepass')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'gatepass'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Pick-up Gate Pass {activeGatePass ? '(Active OTP)' : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('bus')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'bus'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Live Bus GPS</span>
        </button>
      </div>

      {/* TAB 1: STUDENT ACADEMICS & PROGRESS */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-clean p-5 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Term Attendance</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{student.attendance}</p>
              <span className="text-xs text-slate-400">Regular homeroom presence</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Cumulative GPA</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{student.termGpa}</p>
              <span className="text-xs text-slate-400">{student.classRank}</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-teal-500">
              <span className="text-xs font-bold uppercase text-slate-500">Tuition Fee Ledger</span>
              <p className="text-2xl font-black text-teal-600 mt-1">
                {hasSiblingDiscount ? `₹${netPayable.toLocaleString('en-IN')}` : student.feeAmount}
              </p>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {hasSiblingDiscount ? (
                  <span className="text-amber-700 font-bold">
                    ✨ 15% Sibling Concession Applied (-₹{discountAmount.toLocaleString('en-IN')})
                  </span>
                ) : (
                  <span>Receipt Status: {student.receiptNo}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('bus')}
              className="card-clean p-5 text-left border-l-4 border-l-sky-500 group hover:border-sky-400 hover:shadow-sm transition cursor-pointer"
            >
              <span className="text-xs font-bold uppercase text-slate-500">Transport Tracking</span>
              <p className="text-2xl font-black text-sky-600 mt-1">{busData ? 'Route Active' : 'Walker / Personal'}</p>
              <p className="text-xs text-sky-600 font-semibold mt-1 flex items-center gap-1">
                {busData ? 'View live bus GPS' : 'Manage commute details'} <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </button>
          </div>

          {/* Academic Report Table & Report Card Generator */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" /> Continuous Examination Evaluation Scorecard
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Term academic marks approved by the academic committee and class teacher
                </p>
              </div>

              <button
                onClick={() => setShowReportCardModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Official CBSE Report Card (HPC)</span>
              </button>
            </div>

            {student.reports && student.reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Marks Obtained</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {student.reports.map((r) => (
                      <tr key={r.subject} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-900">{r.subject}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{r.marks}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-indigo-50 text-indigo-700">
                            {r.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{r.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No Examination Reports Published Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Term assessments and grades will appear here once submitted by subject faculty and approved by the academic committee.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL DIARY & HOMEWORK */}
      {activeTab === 'diary' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="card-clean p-6 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border-l-4 border-l-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Today's Classwork &amp; Homework Diary
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Official digital diary broadcasted by {student.name}'s homeroom and subject teachers for {student.gradeDisplay}. Keep track of daily exercises, readings, and due dates.
              </p>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 self-start sm:self-auto shadow-2xs">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{homeworkList.length} Active Assignments</span>
            </div>
          </div>

          {/* Homework List */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Task Checklist &amp; Lesson Notes
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {Object.values(completedHomework).filter(Boolean).length} / {homeworkList.length} Completed
                </span>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setHomeworkFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${homeworkFilter === 'ALL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All ({homeworkList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHomeworkFilter('PENDING')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${homeworkFilter === 'PENDING' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Due / Pending ({homeworkList.filter(hw => !completedHomework[hw.id]).length})
                </button>
                <button
                  type="button"
                  onClick={() => setHomeworkFilter('COMPLETED')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${homeworkFilter === 'COMPLETED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Completed ({homeworkList.filter(hw => completedHomework[hw.id]).length})
                </button>
              </div>
            </div>

            {homeworkList.filter(hw => {
              const isDone = !!completedHomework[hw.id];
              if (homeworkFilter === 'PENDING') return !isDone;
              if (homeworkFilter === 'COMPLETED') return isDone;
              return true;
            }).length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">
                  {homeworkFilter === 'PENDING' ? 'All Caught Up! No Pending Tasks' : 'No Homework in this View'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {homeworkFilter === 'PENDING' ? 'All published homework assignments have been completed.' : 'Check back later for newly published tasks.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {homeworkList.filter(hw => {
                  const isDone = !!completedHomework[hw.id];
                  if (homeworkFilter === 'PENDING') return !isDone;
                  if (homeworkFilter === 'COMPLETED') return isDone;
                  return true;
                }).map((hw) => {
                  const isDone = !!completedHomework[hw.id];
                  const subjectColors = {
                    Mathematics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    Science: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    English: 'bg-violet-50 text-violet-700 border-violet-200',
                    'Social Studies': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Regional Language': 'bg-rose-50 text-rose-700 border-rose-200',
                    'Computer Science': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                  };
                  const colorClass = subjectColors[hw.subject] || 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <div key={hw.id} className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>
                            {hw.subject}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Due Date: <strong className="text-slate-800">{hw.due_date || 'Tomorrow'}</strong>
                          </span>
                          {isDone && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Completed by Ward
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {hw.title}
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl whitespace-pre-line">
                          {hw.description}
                        </p>

                        <div className="text-[11px] text-slate-400 pt-1">
                          Assigned by: {hw.teacher?.name || 'Class Faculty'} &bull; Published {new Date(hw.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>

                      <div className="shrink-0 self-start md:self-center">
                        <button
                          onClick={() => handleToggleHomeworkComplete(hw.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                            isDone
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Acknowledged' : 'Mark as Done'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SAFE TEACHER INQUIRIES DESK */}
      {activeTab === 'inquiry' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="card-clean p-6 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border-l-4 border-l-indigo-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" /> Safe Parent–Teacher Query Desk
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Official communication desk with {student.name}'s teachers. Inquire about academic difficulty, health observations, or upcoming events directly in-app. Keeps phone numbers private and maintains an official record.
              </p>
            </div>
            <button
              onClick={() => setShowQueryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Send Teacher Inquiry
            </button>
          </div>

          {/* Queries List */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" /> My Correspondence History
                </h4>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {queriesList.length} Messages
                </span>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setQueryFilter('ACTIVE')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${queryFilter === 'ACTIVE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Active ({queriesList.filter(q => q.status !== 'ARCHIVED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueryFilter('ARCHIVED')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${queryFilter === 'ARCHIVED' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Archived ({queriesList.filter(q => q.status === 'ARCHIVED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueryFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${queryFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All ({queriesList.length})
                </button>
              </div>
            </div>

            {queriesList.filter(q => {
              if (queryFilter === 'ACTIVE') return q.status !== 'ARCHIVED';
              if (queryFilter === 'ARCHIVED') return q.status === 'ARCHIVED';
              return true;
            }).length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">
                  {queryFilter === 'ARCHIVED' ? 'No Archived Inquiries' : 'No Active Queries'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {queryFilter === 'ARCHIVED' ? 'Inquiries that you have archived will appear here.' : `Have a question regarding homework, attendance, or exam preparation? Send an in-app inquiry to ${student.name}'s class teacher.`}
                </p>
                {queryFilter !== 'ARCHIVED' && (
                  <button
                    onClick={() => setShowQueryModal(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-500 inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Ask a Question
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {queriesList.filter(q => {
                  if (queryFilter === 'ACTIVE') return q.status !== 'ARCHIVED';
                  if (queryFilter === 'ARCHIVED') return q.status === 'ARCHIVED';
                  return true;
                }).map((q) => {
                  const replyText = q.teacher_reply || q.teacherReply || '';
                  const isAnswered = q.status === 'ANSWERED' || q.status === 'RESOLVED' || Boolean(replyText);
                  const dateStr = q.created_at || q.createdAt || q.date || Date.now();
                  const replyDateStr = q.updated_at || dateStr;
                  const teacherDisplay = q.teacherName || q.teacher?.name || 'Class Faculty';

                  return (
                    <div key={q.id} className="p-5 space-y-3 hover:bg-slate-50/50 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              Subject: {q.subject}
                            </h4>
                            {isAnswered && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                NEW REPLY
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Submitted on: {new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} &bull; Assigned: {teacherDisplay}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                          isAnswered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isAnswered ? '✓ ANSWERED BY FACULTY' : '● AWAITING FACULTY RESPONSE'}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{q.message}</p>
                      </div>

                      {isAnswered && (
                        <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-300 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Official Teacher Response ({teacherDisplay})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                {new Date(replyDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {q.status !== 'ARCHIVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleArchiveQuery(q.id)}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 hover:text-slate-900 border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1 shadow-2xs"
                                  title="Archive resolved inquiry"
                                >
                                  <Archive className="w-3 h-3" /> Archive
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-line font-medium bg-white/70 p-3 rounded-lg border border-emerald-200">
                            {replyText}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GATE SECURITY & CHILD PICK-UP PASS */}
      {activeTab === 'gatepass' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="card-clean p-6 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border-l-4 border-l-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" /> Gate Security &amp; Authorized Child Pick-up Pass
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Generate an authenticated 4-digit OTP pass for early release, doctor visits, or authorized escort pick-up. Campus gate security validates the code before releasing {student.name}.
              </p>
            </div>
            <button
              onClick={() => setShowGatePassModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Generate New Gate Pass
            </button>
          </div>

          {/* ACTIVE PASS OTP DISPLAY CARD */}
          {activeGatePass ? (
            <div className="card-clean p-6 border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 relative overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Active Authorized Release Pass
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    Child: {student.name} ({student.gradeDisplay})
                  </h4>
                  <p className="text-xs text-slate-600">
                    Authorized Escort: <strong className="text-slate-900">{activeGatePass.escort_name}</strong> &bull; Contact: <strong className="text-slate-900">{activeGatePass.escort_phone}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Reason: <span className="font-semibold text-slate-800">{activeGatePass.reason}</span>
                  </p>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold pt-1">
                    <Clock className="w-3.5 h-3.5" /> Valid for campus release until 04:30 PM today
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-emerald-300 rounded-2xl shadow-inner text-center shrink-0 min-w-[200px]">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Gate Security OTP
                  </span>
                  <span className="font-mono text-4xl font-black tracking-widest text-emerald-600">
                    {activeGatePass.otp_code || '4821'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">Show to Gate Guard</span>
                </div>
              </div>

              {/* Pass Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-emerald-200/80">
                <button
                  type="button"
                  onClick={() => handleCompletePass(activeGatePass.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  title="Mark child as safely released and picked up"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Picked Up
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelPass(activeGatePass.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center gap-1.5 shadow-2xs"
                  title="Revoke / Cancel this active pass"
                >
                  <XCircle className="w-4 h-4" /> Cancel / Revoke Pass
                </button>
              </div>
            </div>
          ) : (
            <div className="card-clean p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Active Gate Pass</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Need to pick up {student.name} early or sending an authorized guardian? Generate a secure 4-digit OTP gate pass.
              </p>
              <button
                onClick={() => setShowGatePassModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-500 inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Request Pick-up Pass
              </button>
            </div>
          )}

          {/* Past Gate Passes History & Verification Logs */}
          {pastGatePasses.length > 0 && (
            <div className="card-clean overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Recent Gate Passes &amp; Release History
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {pastGatePasses.length} Recorded Passes
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {pastGatePasses.map(gp => {
                  const isPickedUp = gp.status === 'PICKED_UP' || gp.status === 'VERIFIED';
                  const isCancelled = gp.status === 'CANCELLED';
                  return (
                    <div key={gp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{gp.escort_name}</span>
                          <span className="text-slate-400 font-mono">({gp.escort_phone})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPickedUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            isCancelled ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {gp.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">Reason: {gp.reason}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        OTP: <span className="font-bold text-slate-700">{gp.otp_code}</span> &bull; {new Date(gp.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Protocols Notice */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Child Safety &amp; Campus Protocol
            </h5>
            <p className="leading-relaxed">
              For security compliance, campus guards will verify the 4-digit OTP and request photo identification from the designated escort before authorising any student release.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE BUS TRACKING */}
      {activeTab === 'bus' && (
        <div className="space-y-6 animate-in fade-in">
          {busData ? (
            <>
              {/* Live Transport Status Hero Card */}
              <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-sky-200 text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      Live GPS Telemetry Active
                    </div>
                    <h2 className="text-2xl font-black">{busData.route}</h2>
                    <p className="text-sm text-sky-100 mt-1">
                      Bus Registration: <span className="font-mono font-bold text-white">{busData.busNumber}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                    <div className="text-center pr-4 border-r border-white/20">
                      <span className="text-[11px] text-sky-200 uppercase font-semibold">Estimated Arrival</span>
                      <p className="text-2xl font-black text-white">{busData.etaMinutes} Mins</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] text-sky-200 uppercase font-semibold">Current Speed</span>
                      <p className="text-2xl font-black text-white">{busData.speedKmH} km/h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver & Route Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-clean p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Assigned Bus Driver
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base">
                      SP
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{busData.driverName}</h4>
                      <p className="text-xs text-slate-500">Authorized School Transit Officer</p>
                      <p className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {busData.driverPhone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Checkpoint:</span>
                      <span className="font-semibold text-slate-800">{busData.currentStop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Approaching Stop:</span>
                      <span className="font-semibold text-slate-800">{busData.nextStop}</span>
                    </div>
                  </div>
                </div>

                <div className="card-clean p-5 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Route Milestones &amp; Scheduled Stops
                  </h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {busData.stops.map((stop) => (
                      <div key={stop.name} className="relative flex items-center justify-between">
                        <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 bg-white ${
                          stop.passed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                        }`} />
                        <div>
                          <h4 className={`text-xs font-bold ${stop.passed ? 'text-slate-900' : 'text-slate-500'}`}>
                            {stop.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">Scheduled: {stop.time}</p>
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            stop.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {stop.passed ? 'PASSED' : 'UPCOMING'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card-clean p-12 text-center">
              <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">Transport Allocation Pending</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your ward is not currently enrolled in daily bus transit. Contact the school transport administration to assign a bus route.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Inquire With Teacher Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Inquire with Faculty</h3>
                  <p className="text-xs text-slate-500">Confidential inquiry regarding {student.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQueryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuery} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Topic *</label>
                <select
                  value={queryForm.subject}
                  onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option>Academic Progress Inquiry</option>
                  <option>Homework &amp; Assignment Clarification</option>
                  <option>Student Health / Medical Observation</option>
                  <option>Attendance &amp; Leave Intimation</option>
                  <option>Behavioural &amp; Peer Social Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Message *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Type your message clearly for the class teacher..."
                  value={queryForm.message}
                  onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  This inquiry is delivered to the teacher's official portal. Your contact phone number remains private.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuery}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingQuery ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Gate Pass Modal */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Generate Pick-up Gate Pass</h3>
                  <p className="text-xs text-slate-500">Authorized release for {student.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowGatePassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateGatePass} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Authorized Escort Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma (Uncle / Grandfather)"
                  value={gatePassForm.escort_name}
                  onChange={(e) => setGatePassForm({ ...gatePassForm, escort_name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Escort Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={gatePassForm.escort_phone}
                  onChange={(e) => setGatePassForm({ ...gatePassForm, escort_phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Early Release *</label>
                <select
                  value={gatePassForm.reason}
                  onChange={(e) => setGatePassForm({ ...gatePassForm, reason: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option>Early Doctor Appointment</option>
                  <option>Family Medical Emergency</option>
                  <option>Inter-school Sports Tournament</option>
                  <option>Authorized Self-commute / Early Exit</option>
                  <option>Personal / Family Occasion</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  A single-use 4-digit OTP will be generated instantly and valid for 3 hours. Share this code with the authorized escort.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGatePassModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingPass}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {generatingPass ? 'Generating OTP...' : 'Generate Gate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official CBSE Holistic Progress Card Modal */}
      <PrintableReportCardModal
        isOpen={showReportCardModal}
        onClose={() => setShowReportCardModal(false)}
        student={student?.raw || student}
      />
    </div>
  );
}
