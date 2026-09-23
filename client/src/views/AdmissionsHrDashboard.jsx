import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Briefcase, FileCheck, CheckCircle2, 
  Clock, Search, Plus, Filter, ChevronRight, Eye, Send 
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

  // New Faculty Appointment Modal Form
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointForm, setAppointForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'PGT Senior Teacher',
    department: 'Mathematics',
    subject: 'Advanced Calculus',
    type: 'teaching',
    qualification: 'M.Sc., B.Ed',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, facRes] = await Promise.all([
        api.getStudents({ limit: 50 }),
        api.getFaculty({ limit: 50 }),
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
        designation: 'PGT Senior Teacher',
        department: 'Mathematics',
        subject: 'Advanced Calculus',
        type: 'teaching',
        qualification: 'M.Sc., B.Ed',
      });
      loadData();
    } catch (err) {
      showToast(err.message || 'Appointment failed', 'error');
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
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
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
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
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

      {/* METRIC CARDS (ALL CLICKABLE TO RESPECTIVE FUNCTIONALITY) */}
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
          <p className="text-2xl font-black text-slate-900 mt-2">{students.length || 50}</p>
          <p className="text-xs text-violet-600 font-semibold mt-1 flex items-center gap-1">
            Review admissions roster <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => setActiveTab('admissions')}
          className="card-clean p-5 text-left group hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verification Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">7</p>
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
            {(Array.isArray(faculty) ? faculty : []).filter(f => f.type === 'teaching').length || 24}
          </p>
          <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
            Manage teacher appointments <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </button>

        <button
          onClick={() => setIsAppointModalOpen(true)}
          className="card-clean p-5 text-left group hover:border-emerald-300 border-dashed"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">New Appointment</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">Issue Offer Letter</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            Appoint teacher or staff <Plus className="w-3.5 h-3.5" />
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
                Click any student card or row to inspect their admission application, entrance marks, and verified certificates.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              Admission Officer View Active
            </span>
          </div>

          <div className="card-clean overflow-hidden">
            <table className="w-full text-left border-collapse">
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
                      ADM-{st.rollNo ? String(st.rollNo).replace('STU-', '') : '2026-091'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{st.grade || st.class || 'Grade 9'}</td>
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
                      <button className="px-3 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-semibold border border-violet-200">
                        View Admission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

          <div className="card-clean overflow-hidden">
            <table className="w-full text-left border-collapse">
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
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
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

      {/* APPOINT NEW FACULTY MODAL */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
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

              <div className="grid grid-cols-2 gap-3">
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
