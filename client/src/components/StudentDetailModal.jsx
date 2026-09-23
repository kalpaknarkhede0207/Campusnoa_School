import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Calendar, MapPin, 
  CheckCircle, AlertTriangle, ShieldAlert, FileText, DollarSign, Award, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function StudentDetailModal({ student, isOpen, onClose, onRefresh }) {
  const { user, showToast } = useAuth();
  const [approving, setApproving] = useState(false);

  if (!isOpen || !student) return null;

  const isAdmissionOfficer = user?.role === 'admissions_officer';
  const isPrincipal = user?.role === 'principal';

  const handleApprove = async () => {
    try {
      setApproving(true);
      await api.approveStudent(student._id || student.id);
      showToast(`Student ${student.name} approved successfully`, 'success');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              {student.name ? student.name.split(' ').map(n => n[0]).join('') : 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {student.grade || student.class || 'Grade 9-A'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  student.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {student.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Roll No: {student.rollNo || student.enrollmentNo || 'STU-2026-091'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Tailored per role */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ADMISSION OFFICER PERSPECTIVE */}
          {isAdmissionOfficer ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Admission & Enrollment Application Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Application Number:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">ADM-{student.rollNo ? String(student.rollNo).replace('STU-', '') : '2026-4421'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Admission Category:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{student.category || 'General Merit'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Previous School / Board:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{student.previousSchool || 'St. Xavier High School (CBSE)'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Entrance / Merit Score:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{student.entranceScore || '92.5 percentile'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Document Verification:</span>
                    <p className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified (Aadhaar, Transfer Cert, Birth Cert)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Enrolled Date:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'June 12, 2025'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Guardian Contact Record</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Parent / Guardian:</span>
                    <p className="font-medium text-slate-800">{student.guardianName || student.parentName || 'Ramesh & Sunita Sharma'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Primary Phone:</span>
                    <p className="font-medium text-slate-800">{student.phone || '+91 98201 44521'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium text-slate-800">{student.email || 'guardian@gmail.com'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Residential Address:</span>
                    <p className="font-medium text-slate-800">{student.address || 'Flat 402, Green Acres, Pune'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PRINCIPAL & GENERAL PERSPECTIVE */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Attendance</span>
                  <p className={`text-xl font-bold mt-1 ${
                    (student.attendanceRate || 88) >= 85 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {student.attendanceRate || student.attendance || 88}%
                  </p>
                  <span className="text-[11px] text-slate-400">Term 1 Record</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Academic GPA</span>
                  <p className="text-xl font-bold text-indigo-600 mt-1">
                    {student.gpa || student.academicAverage || '8.8 / 10'}
                  </p>
                  <span className="text-[11px] text-slate-400">Class Rank: #4</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Fee Standing</span>
                  <p className={`text-xl font-bold mt-1 ${
                    student.feeStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {student.feeStatus || 'PAID'}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {student.feeStatus === 'PAID' ? 'Full Clear' : '₹12,500 Due'}
                  </span>
                </div>
              </div>

              {/* Homeroom & Mentorship */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Class & Mentorship (GFM)</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Class Section:</span>
                    <p className="font-semibold text-slate-800">{student.grade || 'Grade 9-A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Class Teacher:</span>
                    <p className="font-semibold text-slate-800">{student.classTeacher || 'Mrs. Ananya Sharma'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">GFM Mentor:</span>
                    <p className="font-semibold text-slate-800">{student.mentorName || 'Prof. Rajesh Kulkarni'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Disciplinary Status:</span>
                    <p className="font-semibold text-emerald-700">Good Standing (Clean)</p>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Contact Details</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Student Email:</span>
                    <p className="font-medium text-slate-800">{student.email || 'student@school.edu'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Parent / Guardian:</span>
                    <p className="font-medium text-slate-800">{student.guardianName || student.parentName || 'Ramesh Sharma'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Emergency Phone:</span>
                    <p className="font-medium text-slate-800">{student.phone || '+91 98201 44521'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Bus Transport:</span>
                    <p className="font-medium text-slate-800">Route 14 (Baner - School)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500">
            Institutional Record #{student._id ? student._id.substring(student._id.length - 8) : '2026-REC'}
          </div>
          <div className="flex items-center gap-2">
            {isPrincipal && student.status === 'PENDING' && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {approving ? 'Approving...' : 'Approve Admission'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
