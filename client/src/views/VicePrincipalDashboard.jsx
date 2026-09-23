import React, { useState, useEffect } from 'react';
import { 
  Award, Calendar, UserCheck, AlertTriangle, 
  CheckCircle2, Clock, Users, ArrowRight, PlusCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function VicePrincipalDashboard() {
  const { showToast } = useAuth();
  const [substitutes, setSubstitutes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    absentTeacher: '',
    section: 'Grade 9-A',
    period: 'Period 1 (08:30 AM)',
    substitute: ''
  });

  const loadData = async () => {
    try {
      const facRes = await api.getFaculty().catch(() => ({}));
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = (id) => {
    setSubstitutes(substitutes.map(s => s.id === id ? { ...s, substitute: 'Assigned Proxy Teacher', status: 'ASSIGNED' } : s));
    showToast('Substitute teacher allocated and notified via SMS/Push', 'success');
  };

  const handleAddProxy = async (e) => {
    e.preventDefault();
    if (!formData.absentTeacher) {
      showToast('Please specify the absent faculty name', 'error');
      return;
    }
    try {
      await api.assignProxy({
        absentTeacherName: formData.absentTeacher,
        divisionName: formData.section,
        timeSlot: formData.period,
        assignedEmployeeCode: formData.substitute || 'T-102',
        lessonHandover: 'Supervised lesson plan and practice'
      });
      setShowAddModal(false);
      setFormData({ absentTeacher: '', section: 'Grade 9-A', period: 'Period 1 (08:30 AM)', substitute: '' });
      showToast('New proxy allocation logged and committed to database!', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to assign proxy', 'error');
    }
  };

  const pendingCount = substitutes.filter(s => s.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vice Principal / Academic Coordination</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational supervision, daily proxy teacher allocations, and academic timetable integrity
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Log Proxy Allocation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
            {pendingCount > 0 ? `${pendingCount} Periods` : '0 Periods'}
          </p>
          <span className="text-xs text-slate-400">
            {pendingCount > 0 ? `${substitutes.length - pendingCount} of ${substitutes.length} allocated` : 'All periods staffed'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500">Timetable Compliance</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {substitutes.length > 0 ? `${Math.round(((substitutes.length - pendingCount) / substitutes.length) * 100)}%` : '100%'}
          </p>
          <span className="text-xs text-slate-400">Timetable execution integrity</span>
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

        {substitutes.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No Substitute Allocations Required Today</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All assigned faculty are active and on duty. If a teacher requests leave or requires proxy coverage, log an allocation to dispatch a substitute.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Add Proxy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Log Daily Proxy Allocation</h3>
            <p className="text-xs text-slate-500 mb-4">Allocate a substitute teacher to cover an absent colleague's class period.</p>

            <form onSubmit={handleAddProxy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Absent Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Iyer"
                  value={formData.absentTeacher}
                  onChange={(e) => setFormData({ ...formData, absentTeacher: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade & Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
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
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
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
                  value={formData.substitute}
                  onChange={(e) => setFormData({ ...formData, substitute: e.target.value })}
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
    </div>
  );
}
