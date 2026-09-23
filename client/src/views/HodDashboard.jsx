import React from 'react';
import { BookOpen, Users, CheckCircle2, TrendingUp, Award, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HodDashboard() {
  const { showToast } = useAuth();

  const subjects = [
    { subject: 'Grade 9 Mathematics', teacher: 'Mrs. Ananya Sharma', progress: 85, target: 80, status: 'AHEAD' },
    { subject: 'Grade 10 Higher Mathematics', teacher: 'Prof. Ankit Mehta', progress: 88, target: 85, status: 'ON_TRACK' },
    { subject: 'Grade 11 Calculus & Vectors', teacher: 'Dr. S. Kulkarni', progress: 74, target: 78, status: 'SLIGHT_DELAY' },
    { subject: 'Grade 12 Advanced Statistics', teacher: 'Mrs. Rekha Patil', progress: 92, target: 90, status: 'AHEAD' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Head of Department (HOD) Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Department of Mathematics
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Curriculum tracking, syllabus delivery audits, and departmental faculty coordination
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-clean p-5 border-l-4 border-l-blue-500">
          <span className="text-xs font-bold uppercase text-slate-500">Department Faculty</span>
          <p className="text-2xl font-black text-blue-600 mt-1">6 Teachers</p>
          <span className="text-xs text-slate-400">All classes active</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500">Avg Syllabus Covered</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">84.7%</p>
          <span className="text-xs text-slate-400">Target for term: 82%</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500">Department Pass Avg</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">91.4%</p>
          <span className="text-xs text-slate-400">Top ranking in sciences</span>
        </div>
      </div>

      {/* Syllabus Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Delivery & Lesson Plan Audits
          </h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Subject & Level</th>
              <th className="py-3 px-4">Assigned Faculty</th>
              <th className="py-3 px-4">Syllabus Progress</th>
              <th className="py-3 px-4">Benchmark</th>
              <th className="py-3 px-4">Delivery Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {subjects.map((sub) => (
              <tr key={sub.subject} className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-semibold text-slate-900">{sub.subject}</td>
                <td className="py-3 px-4 font-medium text-slate-700">{sub.teacher}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${sub.progress}%` }} />
                    </div>
                    <span className="font-bold text-slate-800">{sub.progress}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-500">{sub.target}% Target</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    sub.status === 'AHEAD'
                      ? 'bg-emerald-50 text-emerald-700'
                      : sub.status === 'ON_TRACK'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
