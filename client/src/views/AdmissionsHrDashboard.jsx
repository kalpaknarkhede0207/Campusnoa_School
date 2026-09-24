import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Briefcase, FileCheck, CheckCircle2, 
  Clock, Search, Plus, Filter, ChevronRight, Eye, Send, Trash2 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentDetailModal from '../components/StudentDetailModal';

export default function AdmissionsHrDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('admissions'); // 'admissions' or 'appointments'
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleDeleteStudent = async (student) => {
    const studentName = student.name || 'this student';
    const studentId = student.admissionNumber || student.rollNo || '';
    if (!window.confirm(`Are you sure you want to remove ${studentName} (${studentId}) from the student admissions register? This will permanently delete their records.`)) {
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

  // New Faculty Appointment Modal Form
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointForm, setAppointForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'TGT',
    department: 'Mathematics',
    subject: 'Mathematics',
    type: 'teaching',
    qualification: 'M.Sc., B.Ed',
    experienceYears: 5,
    joiningDate: new Date().toISOString().split('T')[0]
  });

  // New Student Admission Modal Form
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    fullName: '',
    grade: 'Grade 1',
    section: 'A',
    rollNo: '',
    parentName: '',
    parentWhatsApp: '',
    parentEmail: '',
    bloodGroup: 'B+',
    address: '',
    busRoute: 'Self Walker',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, facRes] = await Promise.all([
        api.getStudents({ limit: 100 }),
        api.getFaculty({ limit: 100 }),
      ]);
      const stuList = Array.isArray(stuRes?.students) ? stuRes.students : (Array.isArray(stuRes) ? stuRes : []);
      const facList = Array.isArray(facRes?.faculty) 
        ? facRes.faculty 
        : (Array.isArray(facRes?.teachers) ? [...facRes.teachers, ...(facRes.nonTeachingStaff || [])] : (Array.isArray(facRes) ? facRes : []));
      setStudents(stuList);
      setFaculty(facList);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admissions and staffing records', 'error');
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

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.hireFaculty(appointForm);
      showToast(`Faculty appointment offer issued to ${appointForm.name}!`, 'success');
      setIsAppointModalOpen(false);
      setAppointForm({
        name: '',
        email: '',
        phone: '',
        designation: 'TGT',
        department: 'Mathematics',
        subject: 'Mathematics',
        type: 'teaching',
        qualification: 'M.Sc., B.Ed',
        experienceYears: 5,
        joiningDate: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      showToast(err.message || 'Appointment failed', 'error');
    }
  };

  const handleCreateAdmission = async (e) => {
    e.preventDefault();
    try {
      await api.admitStudent(admitForm);
      showToast(`Student ${admitForm.fullName} admitted and synchronized to database!`, 'success');
      setIsAdmitModalOpen(false);
      setAdmitForm({
        fullName: '',
        grade: 'Grade 1',
        section: 'A',
        rollNo: '',
        parentName: '',
        parentWhatsApp: '',
        parentEmail: '',
        bloodGroup: 'B+',
        address: '',
        busRoute: 'Self Walker',
        admissionDate: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      showToast(err.message || 'Student admission failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admissions & Faculty Appointing Authority
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional Office — Unified student admissions and teacher appointment authority
          </p>
        </div>

        {/* Subtabs for Admissions & Teacher Appointments */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'admissions'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Admissions ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'appointments'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Teacher Appointing Authority ({faculty.length})</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS (LIVE METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('admissions')}
          className="card-clean p-5 text-left group hover:border-violet-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Admissions Pipeline</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{students.length}</p>
          <p className="text-xs text-violet-600 font-semibold mt-1 flex items-center gap-1">
            Review admissions roster <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => setActiveTab('admissions')}
          className="card-clean p-5 text-left group hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {students.filter(s => s.status === 'PENDING_APPROVAL').length}
          </p>
          <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
            Documents awaiting review <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className="card-clean p-5 text-left group hover:border-indigo-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointed Teachers</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {(Array.isArray(faculty) ? faculty : []).filter(f => f.type === 'teaching').length}
          </p>
          <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
            Manage teacher appointments <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => setIsAdmitModalOpen(true)}
          className="card-clean p-5 text-left group hover:border-violet-400 border-dashed"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">New Student</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">Admit Student</p>
          <p className="text-xs text-violet-600 font-semibold mt-1 flex items-center gap-1">
            Register new enrollment <Plus className="w-3.5 h-3.5" />
          </p>
        </button>
      </div>

      {/* SUBTAB 1: STUDENT ADMISSIONS */}
      {activeTab === 'admissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrolled & Applicant Student Records</h3>
              <p className="text-xs text-slate-500">
                Register fresh students directly into the live institutional database.
              </p>
            </div>
            <button
              onClick={() => setIsAdmitModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Admit New Student
            </button>
          </div>

          {students.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Students Registered Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                The database is clean and live. Click below to register and admit your first student.
              </p>
              <button
                onClick={() => setIsAdmitModalOpen(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                + Admit First Student
              </button>
            </div>
          ) : (
            <div className="card-clean overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Applicant / Student</th>
                    <th className="py-3 px-4">Application No.</th>
                    <th className="py-3 px-4">Applied Grade</th>
                    <th className="py-3 px-4">Admission Category</th>
                    <th className="py-3 px-4">Document Status</th>
                    <th className="py-3 px-4">Admission Status</th>
                    <th className="py-3 px-4 text-right">Inspect Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((st) => (
                    <tr 
                      key={st._id || st.id}
                      onClick={() => setSelectedStudent(st)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                          {st.name ? st.name[0] : 'S'}
                        </div>
                        {st.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {st.admissionNumber || `ADM-${st.rollNo || '001'}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{st.grade || st.class || 'Grade 1'}</td>
                      <td className="py-3 px-4 text-slate-600">{st.category || 'General Merit'}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {st.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedStudent(st)}
                            className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-semibold border border-violet-200"
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
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TEACHER APPOINTING AUTHORITY */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Faculty & Staff Appointments</h3>
              <p className="text-xs text-slate-500">
                Official register of appointed faculty and active appointment offers.
              </p>
            </div>
            <button
              onClick={() => setIsAppointModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Appoint New Faculty
            </button>
          </div>

          {faculty.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Faculty Appointed Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                The database is clean and live. Click below to issue an official appointment offer to your first teacher.
              </p>
              <button
                onClick={() => setIsAppointModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                + Appoint First Teacher
              </button>
            </div>
          ) : (
            <div className="card-clean overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Teacher / Employee</th>
                      <th className="py-3 px-4">Appointment Title</th>
                      <th className="py-3 px-4">Department / Subject</th>
                      <th className="py-3 px-4">Staff Category</th>
                      <th className="py-3 px-4">Qualification</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {faculty.map((f) => (
                      <tr key={f._id || f.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {f.name ? f.name[0] : 'T'}
                          </div>
                          {f.name}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{f.designation || f.subject}</td>
                        <td className="py-3 px-4 text-slate-600">{f.department || 'Academics'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            f.type === 'teaching'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {f.type === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{f.qualification || 'M.Sc., B.Ed'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            CONFIRMED
                          </span>
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

      {/* ADMIT NEW STUDENT MODAL */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Admit New Student</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter student details to register and synchronize their record into the live database.
            </p>

            <form onSubmit={handleCreateAdmission} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={admitForm.fullName}
                  onChange={(e) => setAdmitForm({ ...admitForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade</label>
                  <select
                    value={admitForm.grade}
                    onChange={(e) => setAdmitForm({ ...admitForm, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={admitForm.section}
                    onChange={(e) => setAdmitForm({ ...admitForm, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number (Optional)</label>
                  <input
                    type="number"
                    placeholder="Auto-generated if blank"
                    value={admitForm.rollNo}
                    onChange={(e) => setAdmitForm({ ...admitForm, rollNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={admitForm.bloodGroup}
                    onChange={(e) => setAdmitForm({ ...admitForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={admitForm.parentName}
                    onChange={(e) => setAdmitForm({ ...admitForm, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98220 11223"
                    value={admitForm.parentWhatsApp}
                    onChange={(e) => setAdmitForm({ ...admitForm, parentWhatsApp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Admission</label>
                  <input
                    type="date"
                    required
                    value={admitForm.admissionDate}
                    onChange={(e) => setAdmitForm({ ...admitForm, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transport / Commute</label>
                  <select
                    value={admitForm.busRoute}
                    onChange={(e) => setAdmitForm({ ...admitForm, busRoute: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="Self Walker">Self Commute / Walker</option>
                    <option value="Route 14 (Baner - School)">Route 14 (Baner - School)</option>
                    <option value="Route 04 (Kothrud Express)">Route 04 (Kothrud Express)</option>
                    <option value="Route 08 (Hinjawadi Shuttle)">Route 08 (Hinjawadi Shuttle)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. 102 Green Valley, Pune"
                  value={admitForm.address}
                  onChange={(e) => setAdmitForm({ ...admitForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition"
                >
                  Confirm & Admit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINT NEW FACULTY MODAL */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Issue Faculty Appointment Offer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create an official faculty appointment record signed by the appointing authority.
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Raghavendra Rao"
                  value={appointForm.name}
                  onChange={(e) => setAppointForm({ ...appointForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="raghavendra@campusnoa.edu"
                    value={appointForm.email}
                    onChange={(e) => setAppointForm({ ...appointForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98201 12345"
                    value={appointForm.phone}
                    onChange={(e) => setAppointForm({ ...appointForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Category</label>
                  <select
                    value={appointForm.type}
                    onChange={(e) => setAppointForm({ ...appointForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="teaching">Teaching Faculty</option>
                    <option value="non_teaching">Non-Teaching Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={appointForm.designation}
                    onChange={(e) => setAppointForm({ ...appointForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={appointForm.department}
                    onChange={(e) => setAppointForm({ ...appointForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Subject</label>
                  <input
                    type="text"
                    required
                    value={appointForm.subject}
                    onChange={(e) => setAppointForm({ ...appointForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={appointForm.joiningDate}
                    onChange={(e) => setAppointForm({ ...appointForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={appointForm.experienceYears}
                    onChange={(e) => setAppointForm({ ...appointForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="M.Sc., B.Ed"
                    value={appointForm.qualification}
                    onChange={(e) => setAppointForm({ ...appointForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAppointModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
                >
                  Confirm & Appoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL (ADMISSION OFFICER PERSPECTIVE) */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
