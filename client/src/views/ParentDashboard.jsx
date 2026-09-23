import React, { useState, useEffect } from 'react';
import { 
  User, Bus, Calendar, Award, DollarSign, 
  MapPin, Phone, ShieldCheck, CheckCircle2, Clock, ChevronRight, Navigation 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ParentDashboard() {
  const { user, showToast } = useAuth();
  // Tab 1: Student Academics & Progress, Tab 2: Bus Tracking (strictly per user request)
  const [activeTab, setActiveTab] = useState('student');
  const [busData, setBusData] = useState({
    busNumber: 'MH-12-ED-4421',
    route: 'Route 14 (Baner - Aundh - Campus)',
    driverName: 'Suresh Patil',
    driverPhone: '+91 98810 55412',
    currentStop: 'Baner Bio-Diversity Park Stop',
    nextStop: 'Balewadi High Street',
    destination: 'CampusNoa Main Gate',
    speedKmH: 34,
    etaMinutes: 12,
    status: 'ON_ROUTE',
    liveCoordinates: { lat: 18.5590, lng: 73.7868 },
    stops: [
      { name: 'Baner Depot', time: '07:15 AM', passed: true },
      { name: 'Baner Bio-Diversity Park', time: '07:28 AM', passed: true },
      { name: 'Balewadi High Street', time: '07:42 AM', passed: false },
      { name: 'Aundh Circle', time: '07:55 AM', passed: false },
      { name: 'CampusNoa Gate 2', time: '08:10 AM', passed: false },
    ]
  });

  const studentInfo = {
    name: 'Aarav Sharma',
    rollNo: '9A-01',
    grade: 'Grade 9-A',
    attendance: '96%',
    classRank: '#3 in Class',
    termGpa: '9.2 / 10',
    feeStatus: 'PAID',
    classTeacher: 'Mrs. Ananya Sharma',
  };

  const academicReports = [
    { subject: 'Mathematics', marks: '94/100', grade: 'A1', remarks: 'Exceptional analytical reasoning' },
    { subject: 'Science (Physics & Chem)', marks: '91/100', grade: 'A1', remarks: 'Outstanding laboratory work' },
    { subject: 'English Literature', marks: '88/100', grade: 'A2', remarks: 'Great creative essay' },
    { subject: 'Social Studies', marks: '89/100', grade: 'A2', remarks: 'Strong in modern history' },
    { subject: 'Computer Applications', marks: '98/100', grade: 'A1', remarks: 'Proficient in Python logic' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parent & Guardian Portal</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Ward: {studentInfo.name} ({studentInfo.grade})
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time academic performance, attendance, fee records, and live GPS transport tracking
          </p>
        </div>

        {/* Tab 1: Student, Tab 2: Bus Tracking */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'student'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Academics & Progress</span>
          </button>

          <button
            onClick={() => setActiveTab('bus')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'bus'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Live Bus Tracking</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT ACADEMICS & PROGRESS */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards - CLICKABLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-clean p-5 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Term Attendance</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{studentInfo.attendance}</p>
              <span className="text-xs text-slate-400">114 of 118 days present</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Academic Standing</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{studentInfo.termGpa}</p>
              <span className="text-xs text-slate-400">{studentInfo.classRank}</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-teal-500">
              <span className="text-xs font-bold uppercase text-slate-500">Term 1 Fees</span>
              <p className="text-2xl font-black text-teal-600 mt-1">₹45,000 PAID</p>
              <span className="text-xs text-slate-400">Receipt: REC-901</span>
            </div>

            <button
              onClick={() => setActiveTab('bus')}
              className="card-clean p-5 text-left border-l-4 border-l-sky-500 group hover:border-sky-300 transition"
            >
              <span className="text-xs font-bold uppercase text-slate-500">Transport Tracking</span>
              <p className="text-2xl font-black text-sky-600 mt-1">Route 14 Active</p>
              <p className="text-xs text-sky-600 font-semibold mt-1 flex items-center gap-1">
                View live bus GPS <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </button>
          </div>

          {/* Academic Report Table */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" /> Mid-Term Examination Scorecard
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Grade Average: 92.0% (A1)
              </span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {academicReports.map((r) => (
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
        </div>
      )}

      {/* TAB 2: LIVE BUS TRACKING */}
      {activeTab === 'bus' && (
        <div className="space-y-6 animate-in fade-in">
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
            {/* Driver Details Card */}
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

            {/* Route Milestones Progress */}
            <div className="card-clean p-5 md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Route Milestones & Scheduled Stops
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {busData.stops.map((stop, idx) => (
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
        </div>
      )}
    </div>
  );
}
