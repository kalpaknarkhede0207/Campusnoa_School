import React from 'react';
import { X, Mail, Phone, Calendar, BookOpen, Award, CheckCircle, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

export default function FacultyDetailModal({ faculty, isOpen, onClose }) {
  if (!isOpen || !faculty) return null;

  const isClassTeacher = faculty.homeroomAssignment && faculty.homeroomAssignment !== 'None';
  const assignedClasses = Array.isArray(faculty.assignedClasses) ? faculty.assignedClasses : [];
  const subjectClasses = assignedClasses.filter(c => c && c.role === 'Subject Teacher');
  const allTeachingClasses = assignedClasses.filter(c => c && c.grade);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
              {faculty.name ? faculty.name.split(' ').map(n => n[0]).join('') : 'FC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{faculty.name}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  faculty.type === 'teaching' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {faculty.type === 'teaching' ? 'Teaching Faculty' : 'Non-Teaching Staff'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{faculty.designation || faculty.subject || 'Faculty Member'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TEACHING & CLASS ALLOCATIONS (VISIBLE FOR ALL TEACHING FACULTY) */}
          {faculty.type === 'teaching' && (
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Teaching Roles & Class Governance
              </h4>

              {/* Homeroom / Class Teacher Status */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Class Teacher (Homeroom In-Charge)</span>
                {isClassTeacher ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950">Appointed Class Teacher</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                          {faculty.homeroomAssignment}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-1">
                        Assigned as primary Class Teacher for {faculty.homeroomAssignment}. Leads homeroom attendance, discipline, and student evaluations.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>Not currently appointed as Class Teacher for any homeroom.</span>
                  </div>
                )}
              </div>

              {/* Subject Teaching Allocations */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Subject Teacher Allocations</span>
                {subjectClasses.length > 0 || allTeachingClasses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(subjectClasses.length > 0 ? subjectClasses : allTeachingClasses).map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs text-xs">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{item.subject || faculty.department || 'General'}</p>
                            <span className="text-[10px] text-slate-500">{item.role || 'Subject Teacher'}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
                          {item.grade} {item.section ? `- ${item.section}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-400 italic">
                    No subject teaching allocations assigned yet. (Appoint in Vice Principal Dashboard)
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Professional Profile</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Department:</span>
                <p className="font-semibold text-slate-800">{faculty.department || 'Academics'}</p>
              </div>
              <div>
                <span className="text-slate-500">Subject Specialization:</span>
                <p className="font-semibold text-slate-800">{faculty.subject || faculty.department || 'General Faculty'}</p>
              </div>
              <div>
                <span className="text-slate-500">Qualification:</span>
                <p className="font-semibold text-slate-800">{faculty.qualification || 'Not Specified'}</p>
              </div>
              <div>
                <span className="text-slate-500">Experience:</span>
                <p className="font-semibold text-slate-800">{faculty.experience || 'Not Specified'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Contact & Administrative</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Email:</span>
                <p className="font-medium text-slate-800">{faculty.email || 'Not Provided'}</p>
              </div>
              <div>
                <span className="text-slate-500">Mobile:</span>
                <p className="font-medium text-slate-800">{faculty.phone || 'Not Provided'}</p>
              </div>
              <div>
                <span className="text-slate-500">Employee ID:</span>
                <p className="font-medium text-slate-800">{faculty.employeeId || faculty.code || 'Pending'}</p>
              </div>
              <div>
                <span className="text-slate-500">Joining Date:</span>
                <p className="font-medium text-slate-800">
                  {faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent Appointment')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
