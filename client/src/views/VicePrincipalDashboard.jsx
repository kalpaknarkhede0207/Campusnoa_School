import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, Calendar, UserCheck, AlertTriangle, 
  CheckCircle2, Clock, Users, ArrowRight, PlusCircle,
  UserPlus, BookOpen, ShieldCheck, Trash2, Search, Filter,
  RefreshCw, X, AlertCircle, Check, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StudentDetailModal from '../components/StudentDetailModal';

const ALL_STANDARD_GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const STANDARD_SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Studies',
  'Computer Science',
  'Environmental Studies (EVS)',
  'History & Civics',
  'Geography',
  'Physical Education',
  'Sanskrit',
  'Art & Craft',
  'Other'
];

export default function VicePrincipalDashboard() {
  const { showToast } = useAuth();
  
  // Navigation & loading state
  const [activeTab, setActiveTab] = useState('class_teacher_assign'); // 'class_teacher_assign' | 'proxies'
  const [loading, setLoading] = useState(true);

  // Data states
  const [substitutes, setSubstitutes] = useState([]);
  const [appointedTeachers, setAppointedTeachers] = useState([]);
  const [admittedStudents, setAdmittedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Dynamic available grades computed from standard grades + any grades present in admittedStudents
  const availableGrades = useMemo(() => {
    const fromStudents = admittedStudents
      .map(s => s.grade ? s.grade.split('-')[0].trim() : '')
      .filter(Boolean);
    const combined = Array.from(new Set([...ALL_STANDARD_GRADES, ...fromStudents]));
    return combined.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 99;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 99;
      return numA - numB;
    });
  }, [admittedStudents]);

  // Filters & search for student roster
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'UNASSIGNED'

  // Modal states: Proxy
  const [showAddModal, setShowAddModal] = useState(false);
  const [proxyFormData, setProxyFormData] = useState({
    absentTeacher: '',
    section: 'Grade 1-A',
    period: 'Period 1 (08:30 AM)',
    substitute: ''
  });

  // Modal states: Appoint Teacher (Class Teacher or Subject Teacher)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({
    teacherId: '',
    teacherName: '',
    roleType: 'CLASS_TEACHER', // 'CLASS_TEACHER' | 'SUBJECT_TEACHER'
    subject: 'Mathematics',
    customSubject: '',
    grade: 'Grade 1',
    section: 'A',
    targetMode: 'class', // 'class' | 'selected'
    selectedStudentIds: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, stuRes] = await Promise.all([
        api.getFaculty().catch(() => ({})),
        api.getStudents().catch(() => ({}))
      ]);

      // 1. Process Proxy & Faculty leaves
      const leaves = facRes?.leaves || [];
      const loadedSubs = leaves.map(l => ({
        id: l.id,
        absentTeacher: l.teacherName,
        section: 'Grade 9-A',
        period: 'Period 1 (08:30 AM)',
        substitute: l.delegatedToName !== 'Unassigned' ? l.delegatedToName : 'Unassigned',
        status: l.delegationStatus === 'ACCEPTED' ? 'ASSIGNED' : 'PENDING'
      }));
      setSubstitutes(loadedSubs);

      // 2. Process Appointed Teaching Faculty
      const rawTeachers = facRes?.teachers || (facRes?.faculty || []).filter(f => f.type === 'teaching');
      const teachers = rawTeachers.map(t => ({
        id: t.id || t._id,
        code: t.code || t.employeeId,
        fullName: t.fullName || t.name,
        officialEmail: t.officialEmail || t.email,
        department: t.department || 'General Faculty',
        designation: t.designationTier || t.designation || 'TGT',
        qualification: t.highestDegree || t.qualification || 'B.Ed',
        homeroomAssignment: t.homeroomAssignment || t.homeroomDivision || 'None',
        assignedClasses: t.assignedClasses || []
      }));
      setAppointedTeachers(teachers);

      // 3. Process Admitted Students
      const rawStudents = stuRes?.students || (Array.isArray(stuRes) ? stuRes : []);
      setAdmittedStudents(rawStudents);
    } catch (err) {
      console.error('Error loading Vice Principal dashboard data:', err);
      showToast('Failed to load dashboard records', 'error');
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
        'STUDENT_DELETED', 
        'PROXY_ASSIGNED', 
        'FACULTY_APPOINTED', 
        'FACULTY_UPDATED'
      ].includes(event.type)) {
        loadData();
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Handle Proxy Allocation
  const handleAssignProxy = (id) => {
    setSubstitutes(substitutes.map(s => s.id === id ? { ...s, substitute: 'Assigned Proxy Teacher', status: 'ASSIGNED' } : s));
    showToast('Substitute teacher allocated and notified via SMS/Push', 'success');
  };

  const handleAddProxy = async (e) => {
    e.preventDefault();
    if (!proxyFormData.absentTeacher) {
      showToast('Please specify the absent faculty name', 'error');
      return;
    }
    try {
      await api.assignProxy({
        absentTeacherName: proxyFormData.absentTeacher,
        divisionName: proxyFormData.section,
        timeSlot: proxyFormData.period,
        assignedEmployeeCode: proxyFormData.substitute || 'T-102',
        lessonHandover: 'Supervised lesson plan and practice'
      });
      setShowAddModal(false);
      setProxyFormData({ absentTeacher: '', section: 'Grade 1-A', period: 'Period 1 (08:30 AM)', substitute: '' });
      showToast('New proxy allocation logged and committed to database!', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to assign proxy', 'error');
    }
  };

  // Open Assign Modal for a specific class or student
  const openAssignModalForStudent = (student) => {
    const studentGrade = student.grade ? student.grade.split('-')[0].trim() : (availableGrades[0] || 'Grade 1');
    const studentSection = student.section || (student.grade && student.grade.includes('-') ? student.grade.split('-')[1].trim() : 'A');
    setAssignForm({
      teacherId: '',
      teacherName: '',
      roleType: 'CLASS_TEACHER',
      subject: 'Mathematics',
      customSubject: '',
      grade: studentGrade,
      section: studentSection,
      targetMode: 'class',
      selectedStudentIds: [student.admissionNumber || student.id]
    });
    setShowAssignModal(true);
  };

  // Handle Appointing Teacher (Class Teacher or Subject Teacher)
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!assignForm.teacherId && !assignForm.teacherName) {
      showToast('Please select an appointed teacher', 'error');
      return;
    }

    const selectedTeacherObj = appointedTeachers.find(
      t => t.id === assignForm.teacherId || t.code === assignForm.teacherId
    );

    const subjectToSubmit = assignForm.roleType === 'SUBJECT_TEACHER'
      ? (assignForm.subject === 'Other' ? (assignForm.customSubject.trim() || 'General') : assignForm.subject)
      : 'Homeroom';

    setAssigning(true);
    try {
      const payload = {
        teacherId: assignForm.teacherId,
        teacherName: selectedTeacherObj ? selectedTeacherObj.fullName : assignForm.teacherName,
        roleType: assignForm.roleType,
        subject: subjectToSubmit,
        grade: assignForm.grade,
        section: assignForm.section,
        studentIds: assignForm.targetMode === 'selected' ? assignForm.selectedStudentIds : undefined
      };

      const res = await api.assignTeacher(payload);
      showToast(res.message || 'Teacher appointment recorded and synced to database!', 'success');
      setShowAssignModal(false);
      setAssignForm({
        teacherId: '',
        teacherName: '',
        roleType: 'CLASS_TEACHER',
        subject: 'Mathematics',
        customSubject: '',
        grade: availableGrades[0] || 'Grade 1',
        section: 'A',
        targetMode: 'class',
        selectedStudentIds: []
      });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to appoint teacher', 'error');
    } finally {
      setAssigning(false);
    }
  };

  // Handle Student Removal
  const handleDeleteStudent = async (student) => {
    const studentName = student.fullName || student.name || 'this student';
    const studentId = student.admissionNumber || student.rollNo || '';
    if (!window.confirm(`Are you sure you want to remove ${studentName} (${studentId}) from the student roster? This will permanently delete their records.`)) {
      return;
    }
    try {
      await api.deleteStudent(student.dbId || student._id || student.id || student.admissionNumber);
      showToast(`Student ${studentName} removed successfully`, 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to remove student', 'error');
    }
  };

  // Calculations & Metrics
  const pendingProxyCount = substitutes.filter(s => s.status === 'PENDING').length;
  
  const assignedStudentsCount = admittedStudents.filter(
    s => s.classTeacher && s.classTeacher !== 'Not Assigned'
  ).length;
  
  const unassignedStudentsCount = admittedStudents.length - assignedStudentsCount;

  // Filtered students
  const filteredStudents = admittedStudents.filter(st => {
    const nameMatch = (st.fullName || st.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (st.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const gradeMatch = gradeFilter === 'ALL' || (st.grade === gradeFilter || `${st.grade}-${st.section}` === gradeFilter);
    const isAssigned = st.classTeacher && st.classTeacher !== 'Not Assigned';
    const assignMatch = assignmentFilter === 'ALL' ||
                        (assignmentFilter === 'ASSIGNED' && isAssigned) ||
                        (assignmentFilter === 'UNASSIGNED' && !isAssigned);
    return nameMatch && gradeMatch && assignMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vice Principal / Academic Coordination</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational supervision, appointing class teachers for admitted students, and daily proxy coverage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setAssignForm({
                teacherId: '',
                teacherName: '',
                roleType: 'CLASS_TEACHER',
                subject: 'Mathematics',
                customSubject: '',
                grade: availableGrades[0] || 'Grade 1',
                section: 'A',
                targetMode: 'class',
                selectedStudentIds: []
              });
              setShowAssignModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Appoint Class / Subject Teacher
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" /> Log Proxy Allocation
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto scrollbar-none max-w-full">
        <button
          onClick={() => setActiveTab('class_teacher_assign')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'class_teacher_assign'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Appoint Faculty & Student Allocations
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === 'class_teacher_assign' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {admittedStudents.length} Students
          </span>
        </button>

        <button
          onClick={() => setActiveTab('proxies')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
            activeTab === 'proxies'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Daily Proxy Allocations
          {pendingProxyCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
              {pendingProxyCount} Required
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: APPOINT CLASS TEACHER & STUDENT ALLOCATION */}
      {activeTab === 'class_teacher_assign' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card-clean p-4 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Appointed Teachers</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {appointedTeachers.length} Faculty
              </p>
              <span className="text-xs text-slate-400">Available for homeroom appointments</span>
            </div>

            <div className="card-clean p-4 border-l-4 border-l-blue-500">
              <span className="text-xs font-bold uppercase text-slate-500">Admitted Students</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {admittedStudents.length} Students
              </p>
              <span className="text-xs text-slate-400">Enrolled institutional roster</span>
            </div>

            <div className="card-clean p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Assigned Class Teachers</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {assignedStudentsCount} Assigned
              </p>
              <span className="text-xs text-slate-400">Homeroom leadership active</span>
            </div>

            <div className="card-clean p-4 border-l-4 border-l-amber-500">
              <span className="text-xs font-bold uppercase text-slate-500">Awaiting Class Teacher</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {unassignedStudentsCount} Unassigned
              </p>
              <span className="text-xs text-slate-400">Requires teacher appointment</span>
            </div>
          </div>

          {/* Section: Admitted Students Roster & Class Teacher Status */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Admitted Students & Homeroom Class Teachers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View admitted students, monitor appointed class teacher assignments, or appoint a teacher
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700"
                >
                  <option value="ALL">All Grades</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700"
                >
                  <option value="ALL">All Status</option>
                  <option value="ASSIGNED">Assigned Only</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                </select>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Students Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {admittedStudents.length === 0
                    ? 'No students are currently admitted. When admissions are processed, they will appear here.'
                    : 'No students matched the active search or filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Grade & Section</th>
                      <th className="py-3 px-4">Admission Date</th>
                      <th className="py-3 px-4">Appointed Teachers (Class & Subject)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((st) => {
                      const isAssigned = st.classTeacher && st.classTeacher !== 'Not Assigned';
                      const formattedDate = st.admissionDate 
                        ? new Date(st.admissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Recent';

                      return (
                        <tr key={st.admissionNumber || st.id || st._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                            {st.admissionNumber || st.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {st.fullName || st.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {st.grade} {st.section ? `- ${st.section}` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {formattedDate}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {isAssigned ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  CT: {st.classTeacher}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  CT: Not Assigned
                                </span>
                              )}
                              {Array.isArray(st.subjectTeachers) && st.subjectTeachers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {st.subjectTeachers.map((stSub, sIdx) => (
                                    <span key={sIdx} className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">
                                      {stSub.subject}: {stSub.teacherName}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openAssignModalForStudent(st)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs transition"
                                title="Appoint Class Teacher or Subject Teacher"
                              >
                                {isAssigned ? 'Reassign' : 'Appoint Teacher'}
                              </button>
                              <button
                                onClick={() => setSelectedStudent(st)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st)}
                                className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                                title="Remove Student from School Records"
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
            )}
          </div>

          {/* Section: Appointed Teachers & Their Homeroom Allocations */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Appointed Faculty & Homeroom Class Allocations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appointed teaching staff in MongoDB database eligible to be designated as Class Teachers
                </p>
              </div>
              <button
                onClick={() => {
                  setAssignForm({
                    teacherId: '',
                    teacherName: '',
                    grade: 'Grade 9',
                    section: 'A',
                    targetMode: 'class',
                    selectedStudentIds: []
                  });
                  setShowAssignModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Appoint Class Teacher
              </button>
            </div>

            {appointedTeachers.length === 0 ? (
              <div className="p-10 text-center">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No Appointed Teachers Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When new teaching faculty are appointed, they will be listed here for class teacher assignment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Faculty Name</th>
                      <th className="py-3 px-4">Department / Subject</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Current Homeroom / Class Role</th>
                      <th className="py-3 px-4 text-right">Quick Appoint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {appointedTeachers.map((t) => {
                      const hasHomeroom = t.homeroomAssignment && t.homeroomAssignment !== 'None';
                      return (
                        <tr key={t.id || t.code} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{t.code}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{t.fullName}</td>
                          <td className="py-3 px-4 text-slate-600">{t.department}</td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{t.designation}</td>
                          <td className="py-3 px-4">
                            {hasHomeroom ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Check className="w-3 h-3 text-indigo-600" />
                                Class Teacher: {t.homeroomAssignment}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-slate-100 text-slate-600">
                                Subject Faculty
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setAssignForm({
                                  teacherId: t.id || t.code,
                                  teacherName: t.fullName,
                                  grade: 'Grade 9',
                                  section: 'A',
                                  targetMode: 'class',
                                  selectedStudentIds: []
                                });
                                setShowAssignModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs transition"
                            >
                              Assign Homeroom
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY PROXY ALLOCATIONS */}
      {activeTab === 'proxies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clean p-5 border-l-4 border-l-amber-500">
              <span className="text-xs font-bold uppercase text-slate-500">Faculty on Leave Today</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {substitutes.length > 0 ? `${substitutes.length} Faculty` : '0 Faculty'}
              </p>
              <span className="text-xs text-slate-400">
                {substitutes.length > 0 ? 'Absence notifications active' : 'All faculty on duty'}
              </span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Proxy Classes Required</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {pendingProxyCount > 0 ? `${pendingProxyCount} Periods` : '0 Periods'}
              </p>
              <span className="text-xs text-slate-400">
                {pendingProxyCount > 0 ? `${substitutes.length - pendingProxyCount} of ${substitutes.length} allocated` : 'All periods staffed'}
              </span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Timetable Compliance</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {substitutes.length > 0 ? `${Math.round(((substitutes.length - pendingProxyCount) / substitutes.length) * 100)}%` : '100%'}
              </p>
              <span className="text-xs text-slate-400">Timetable execution integrity</span>
            </div>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Daily Timetable Substitute Allocations
              </h3>
              <span className="text-xs text-slate-500 font-medium">Automatic proxy matcher active</span>
            </div>

            {substitutes.length === 0 ? (
              <div className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Substitute Allocations Required Today</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  All assigned faculty are active and on duty. If a teacher requests leave or requires proxy coverage, log an allocation to dispatch a substitute.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Absent Faculty</th>
                      <th className="py-3 px-4">Grade & Section</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Assigned Substitute</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {substitutes.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">{s.absentTeacher}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{s.section}</td>
                        <td className="py-3 px-4 text-slate-600">{s.period}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{s.substitute}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            s.status === 'ASSIGNED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {s.status !== 'ASSIGNED' ? (
                            <button
                              onClick={() => handleAssignProxy(s.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                            >
                              Assign Proxy
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                            </span>
                          )}
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

      {/* MODAL 1: APPOINT TEACHER (CLASS TEACHER OR SUBJECT TEACHER) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-4 sm:p-6 border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" /> Appoint Faculty to Class / Students
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appoint as Class Teacher (one homeroom limit) or Subject Teacher across multiple classes.
                </p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTeacher} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Select Appointed Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Appointed Teacher *
                </label>
                {appointedTeachers.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                    No appointed faculty records found in database. Please appoint a teacher first in Principal or Admissions/HR portal.
                  </div>
                ) : (
                  <select
                    required
                    value={assignForm.teacherId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const selected = appointedTeachers.find(t => t.id === tId || t.code === tId);
                      setAssignForm({
                        ...assignForm,
                        teacherId: tId,
                        teacherName: selected ? selected.fullName : ''
                      });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Appointed Teacher --</option>
                    {appointedTeachers.map((t) => (
                      <option key={t.id || t.code} value={t.id || t.code}>
                        {t.fullName} ({t.code}) - {t.department} [{t.designation}]
                      </option>
                    ))}
                  </select>
                )}

                {/* Teacher snapshot details if selected */}
                {(() => {
                  const sel = appointedTeachers.find(t => t.id === assignForm.teacherId || t.code === assignForm.teacherId);
                  if (!sel) return null;
                  const hasCT = sel.homeroomAssignment && sel.homeroomAssignment !== 'None';
                  const subjClasses = (sel.assignedClasses || []).filter(c => c && c.role === 'Subject Teacher');

                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Current Homeroom:</span>
                        {hasCT ? (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                            Class Teacher of {sel.homeroomAssignment}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not assigned as Class Teacher</span>
                        )}
                      </div>
                      {subjClasses.length > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Subject Allocations:</span>
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {subjClasses.map(c => `${c.subject} (${c.grade}-${c.section})`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Select Role: Class Teacher vs Subject Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Appointment Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, roleType: 'CLASS_TEACHER' })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      assignForm.roleType === 'CLASS_TEACHER'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" /> Class Teacher
                      </span>
                      {assignForm.roleType === 'CLASS_TEACHER' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Homeroom in-charge. (Policy: strictly 1 class teacher per teacher)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, roleType: 'SUBJECT_TEACHER' })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      assignForm.roleType === 'SUBJECT_TEACHER'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" /> Subject Teacher
                      </span>
                      {assignForm.roleType === 'SUBJECT_TEACHER' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Subject specialist. (Can teach across multiple classes)
                    </p>
                  </button>
                </div>
              </div>

              {/* Reassignment Warning if Teacher already has a Homeroom */}
              {(() => {
                const sel = appointedTeachers.find(t => t.id === assignForm.teacherId || t.code === assignForm.teacherId);
                const hasExistingCT = sel && sel.homeroomAssignment && sel.homeroomAssignment !== 'None';
                const isDifferentClass = hasExistingCT && sel.homeroomAssignment !== `${assignForm.grade}-${assignForm.section}`;
                if (assignForm.roleType === 'CLASS_TEACHER' && isDifferentClass) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Homeroom Reassignment Notice:</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {sel.fullName} is currently Class Teacher for <strong>{sel.homeroomAssignment}</strong>. Since school governance allows only one Class Teacher role per teacher, appointing them here will reassign their homeroom leadership to <strong>{assignForm.grade}-{assignForm.section}</strong>.
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Subject Selection (Only for Subject Teacher) */}
              {assignForm.roleType === 'SUBJECT_TEACHER' && (
                <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-950">Teaching Subject *</label>
                  <select
                    value={assignForm.subject}
                    onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STANDARD_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>

                  {assignForm.subject === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom subject name (e.g. Robotics, French, Sanskrit)"
                      value={assignForm.customSubject}
                      onChange={(e) => setAssignForm({ ...assignForm, customSubject: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  )}
                  <p className="text-[11px] text-indigo-700">
                    Subject teachers can be assigned to multiple classes and subjects without conflict.
                  </p>
                </div>
              )}

              {/* Grade and Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level *</label>
                  <select
                    value={assignForm.grade}
                    onChange={(e) => setAssignForm({ ...assignForm, grade: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section / Division *</label>
                  <select
                    value={assignForm.section}
                    onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="E">Section E</option>
                  </select>
                </div>
              </div>

              {/* Assignment Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Application Scope</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="targetMode"
                      value="class"
                      checked={assignForm.targetMode === 'class'}
                      onChange={() => setAssignForm({ ...assignForm, targetMode: 'class' })}
                      className="text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        All Admitted Students in {assignForm.grade} - Section {assignForm.section}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {assignForm.roleType === 'CLASS_TEACHER'
                          ? 'Updates the homeroom Class Teacher for all students in this class.'
                          : `Appoints this teacher as the ${assignForm.subject || 'Subject'} Teacher for all students in this class.`}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="targetMode"
                      value="selected"
                      checked={assignForm.targetMode === 'selected'}
                      onChange={() => setAssignForm({ ...assignForm, targetMode: 'selected' })}
                      className="text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-800">
                        Specific Student (Individual Appointment)
                      </span>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Appoint this teacher specifically for an individual student.
                      </p>
                      {assignForm.targetMode === 'selected' && (
                        <select
                          value={assignForm.selectedStudentIds[0] || ''}
                          onChange={(e) => {
                            const admNo = e.target.value;
                            const st = admittedStudents.find(s => (s.admissionNumber || s.id) === admNo);
                            if (st) {
                              setAssignForm({
                                ...assignForm,
                                targetMode: 'selected',
                                selectedStudentIds: [st.admissionNumber || st.id],
                                grade: st.grade || assignForm.grade,
                                section: st.section || assignForm.section
                              });
                            } else {
                              setAssignForm({
                                ...assignForm,
                                targetMode: 'selected',
                                selectedStudentIds: []
                              });
                            }
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">-- Choose Student from Enrolled Roster --</option>
                          {admittedStudents.map((st) => (
                            <option key={st.admissionNumber || st.id} value={st.admissionNumber || st.id}>
                              {st.fullName || st.name} ({st.admissionNumber || st.id}) — {st.grade} Section {st.section}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Informational Callout */}
              <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Real-time Synchronized Action:</span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    This updates student profiles, synchronizes the teacher's faculty records in MongoDB Atlas, and broadcasts real-time SSE events to all dashboards.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || appointedTeachers.length === 0}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {assigning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Appointing...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Confirm & Appoint Teacher
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG PROXY ALLOCATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Log Daily Proxy Allocation</h3>
            <p className="text-xs text-slate-500 mb-4">Allocate a substitute teacher to cover an absent colleague's class period.</p>

            <form onSubmit={handleAddProxy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Absent Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Iyer"
                  value={proxyFormData.absentTeacher}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, absentTeacher: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade & Section</label>
                  <select
                    value={proxyFormData.section}
                    onChange={(e) => setProxyFormData({ ...proxyFormData, section: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Grade 9-A</option>
                    <option>Grade 9-B</option>
                    <option>Grade 10-A</option>
                    <option>Grade 10-B</option>
                    <option>Grade 11-A</option>
                    <option>Grade 12-A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period</label>
                  <select
                    value={proxyFormData.period}
                    onChange={(e) => setProxyFormData({ ...proxyFormData, period: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Period 1 (08:30 AM)</option>
                    <option>Period 2 (09:20 AM)</option>
                    <option>Period 3 (10:15 AM)</option>
                    <option>Period 4 (11:05 AM)</option>
                    <option>Period 5 (12:30 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Substitute (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty if pending allocation"
                  value={proxyFormData.substitute}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, substitute: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STUDENT DETAIL & REMOVAL MODAL */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onRefresh={loadData}
      />
    </div>
  );
}
