import React from 'react';
import { X, Mail, Phone, Calendar, BookOpen, Award, CheckCircle } from 'lucide-react';

export default function FacultyDetailModal({ faculty, isOpen, onClose }) {
  if (!isOpen || !faculty) return null;

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
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Professional Profile</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Department:</span>
                <p className="font-semibold text-slate-800">{faculty.department || 'Science & Mathematics'}</p>
              </div>
              <div>
                <span className="text-slate-500">Subject Specialization:</span>
                <p className="font-semibold text-slate-800">{faculty.subject || 'Physics / General Science'}</p>
              </div>
              <div>
                <span className="text-slate-500">Qualification:</span>
                <p className="font-semibold text-slate-800">{faculty.qualification || 'M.Sc., B.Ed'}</p>
              </div>
              <div>
                <span className="text-slate-500">Experience:</span>
                <p className="font-semibold text-slate-800">{faculty.experience || '8+ Years'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Contact & Administrative</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Email:</span>
                <p className="font-medium text-slate-800">{faculty.email || 'faculty@campusnoa.edu'}</p>
              </div>
              <div>
                <span className="text-slate-500">Mobile:</span>
                <p className="font-medium text-slate-800">{faculty.phone || '+91 94220 18839'}</p>
              </div>
              <div>
                <span className="text-slate-500">Employee ID:</span>
                <p className="font-medium text-slate-800">{faculty.employeeId || 'EMP-2024-041'}</p>
              </div>
              <div>
                <span className="text-slate-500">Joining Date:</span>
                <p className="font-medium text-slate-800">{faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString() : 'Aug 1, 2022'}</p>
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
