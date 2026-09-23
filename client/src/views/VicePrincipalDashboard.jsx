import React, { useState } from 'react';
import { 
  Award, Calendar, UserCheck, AlertTriangle, 
  CheckCircle2, Clock, Users, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VicePrincipalDashboard() {
  const { showToast } = useAuth();
  const [substitutes, setSubstitutes] = useState([
    { id: 'sub-1', absentTeacher: 'Dr. Ramesh Iyer (Physics)', section: 'Grade 10-B', period: 'Period 3 (10:15 AM)', substitute: 'Prof. Ankit Mehta', status: 'ASSIGNED' },
    { id: 'sub-2', absentTeacher: 'Mrs. Sunita Deshmukh (History)', section: 'Grade 9-A', period: 'Period 5 (12:30 PM)', substitute: 'Unassigned', status: 'PENDING' },
  ]);

  const handleAssign = (id) => {
    setSubstitutes(substitutes.map(s => s.id === id ? { ...s, substitute: 'Mr. Arvind Joshi', status: 'ASSIGNED' } : s));
    showToast('Substitute teacher allocated and notified via SMS/Push', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vice Principal / Academic Coordination</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational supervision, daily proxy teacher allocations, and academic timetable integrity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-clean p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-500">Faculty on Leave Today</span>
          <p className="text-2xl font-black text-amber-600 mt-1">2 Faculty</p>
          <span className="text-xs text-slate-400">Leaves pre-sanctioned</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500">Proxy Classes Required</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">4 Periods</p>
          <span className="text-xs text-slate-400">3 of 4 allocated</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500">Curriculum Compliance</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">94.8%</p>
          <span className="text-xs text-slate-400">On schedule with annual plan</span>
        </div>
      </div>

      {/* Proxy / Substitute Allocation Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" /> Daily Timetable Substitute Allocations
          </h3>
          <span className="text-xs text-slate-500 font-medium">Automatic proxy matcher active</span>
        </div>

        <table className="w-full text-left border-collapse">
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
                      onClick={() => handleAssign(s.id)}
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
    </div>
  );
}
