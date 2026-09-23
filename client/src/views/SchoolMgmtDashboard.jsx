import React from 'react';
import { Building2, TrendingUp, Users, DollarSign, ShieldCheck, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SchoolMgmtDashboard() {
  const { showToast } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Board of Trustees & Institutional Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-300">
              Executive Governance
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Long-range capital planning, institutional compliance, revenue realization, and academic ranking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-clean p-5 border-l-4 border-l-indigo-600">
          <span className="text-xs font-bold uppercase text-slate-500">Annual Institutional Budget</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">₹14.80 Cr</p>
          <span className="text-xs text-slate-400">84% Utilized this FY</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold uppercase text-slate-500">Student Retention Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">98.4%</p>
          <span className="text-xs text-slate-400">Top 1% across state</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-sky-600">
          <span className="text-xs font-bold uppercase text-slate-500">Staff Retention & NPS</span>
          <p className="text-2xl font-black text-sky-600 mt-1">94.2%</p>
          <span className="text-xs text-slate-400">Faculty satisfaction high</span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-amber-600">
          <span className="text-xs font-bold uppercase text-slate-500">Accreditation Standing</span>
          <p className="text-2xl font-black text-amber-600 mt-1">NAAC A++ / CBSE</p>
          <span className="text-xs text-slate-400">Renewal valid till 2028</span>
        </div>
      </div>

      <div className="card-clean p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Executive Compliance & Statutory Audit Status
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          All statutory mandates including CBSE Affiliation Bylaws, RTE Act norms, fire safety clearances, 
          and school bus transport fitness certifications are up to date and verified for academic session 2025–2026.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Statutory Tax & PF Audit:</span>
            <p className="font-bold text-emerald-700 mt-0.5">Cleared & Compliant</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Campus Infrastructure Safety:</span>
            <p className="font-bold text-emerald-700 mt-0.5">Certified (Grade A)</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Digital Data Governance:</span>
            <p className="font-bold text-emerald-700 mt-0.5">DPDP Compliant (Auth0 + TLS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
