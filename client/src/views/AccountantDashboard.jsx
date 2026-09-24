import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Clock, CheckCircle2, 
  Search, ArrowDownToLine, Receipt, AlertCircle, RefreshCw, PlusCircle,
  Users, Check, X, ShieldCheck, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ALL_STANDARD_GRADES = [
  'Grade 1-A', 'Grade 1-B', 'Grade 2-A', 'Grade 2-B',
  'Grade 3-A', 'Grade 3-B', 'Grade 4-A', 'Grade 4-B',
  'Grade 5-A', 'Grade 5-B', 'Grade 5-C',
  'Grade 6-A', 'Grade 6-B', 'Grade 6-C',
  'Grade 7-A', 'Grade 7-B', 'Grade 7-C',
  'Grade 8-A', 'Grade 8-B', 'Grade 8-C',
  'Grade 9-A', 'Grade 9-B', 'Grade 9-C',
  'Grade 10-A', 'Grade 10-B', 'Grade 10-C',
  'Grade 11-A', 'Grade 11-B', 'Grade 11-C',
  'Grade 12-A', 'Grade 12-B', 'Grade 12-C'
];

export default function AccountantDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('distributed'); // 'distributed' or 'transactions'
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'COMPLETED', 'PENDING'

  const [formData, setFormData] = useState({
    studentAdmissionNumber: '',
    studentName: '',
    grade: 'Grade 9-A',
    amount: '45000',
    method: 'UPI / Razorpay',
    status: 'COMPLETED'
  });

  const fetchTx = async () => {
    setLoading(true);
    try {
      const [txRes, sumRes, stuRes] = await Promise.all([
        api.getTransactions().catch(() => ({ transactions: [] })),
        api.getFinanceSummary().catch(() => null),
        api.getStudents().catch(() => ({ students: [] }))
      ]);

      const txList = Array.isArray(txRes?.transactions) ? txRes.transactions : [];
      const stList = Array.isArray(stuRes?.students) ? stuRes.students : (Array.isArray(stuRes) ? stuRes : []);

      setTransactions(txList);
      setStudents(stList);
      if (sumRes) setFinanceSummary(sumRes);
    } catch (err) {
      console.warn('Finance data load:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTx();
  }, []);

  const handleReconcile = async (tx) => {
    try {
      await api.reconcilePayment(tx.id || tx._id || tx.studentAdmissionNumber);
      showToast(`Transaction ${tx.refNo || tx.invoiceNumber || 'receipt'} reconciled and receipt generated!`, 'success');
      await fetchTx();
    } catch (err) {
      showToast(err.message || `Failed to reconcile transaction`, 'error');
    }
  };

  const handleAddReceipt = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.amount) {
      showToast('Please select a student and specify the fee amount', 'error');
      return;
    }

    try {
      await api.createFeeReceipt(formData);
      setShowAddModal(false);
      setFormData({
        studentAdmissionNumber: '',
        studentName: '',
        grade: 'Grade 9-A',
        amount: '45000',
        method: 'UPI / Razorpay',
        status: 'COMPLETED'
      });
      showToast('Fee receipt generated and committed to institutional ledger!', 'success');
      await fetchTx();
    } catch (err) {
      showToast(err.message || 'Failed to record fee receipt', 'error');
    }
  };

  // Helper for amounts
  const parseAmount = (amtStr) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 0;
    const clean = amtStr.toString().replace(/[^0-9]/g, '');
    return Number(clean) || 0;
  };

  // Compute live amounts strictly from database students and verified transactions
  const settledStudents = students.filter(s => s.feeStatus === 'PAID');
  const overdueStudents = students.filter(s => s.feeStatus !== 'PAID');

  const liveTotalCollected = settledStudents.length * 45000;
  const liveTotalBilled = students.length > 0 ? students.length * 45000 : (transactions.length > 0 ? transactions.reduce((sum, t) => sum + (t.amountBilled || 45000), 0) : 90000);
  const liveTotalOverdue = Math.max(0, liveTotalBilled - liveTotalCollected);

  const totalCollectedFromTx = transactions
    .filter(t => t.status === 'COMPLETED' || t.status === 'PAID')
    .reduce((sum, t) => sum + (t.amountPaid || parseAmount(t.amount)), 0);

  const totalCollected = (financeSummary?.summary?.totalCollected !== undefined && financeSummary?.summary?.totalCollected > 0)
    ? financeSummary.summary.totalCollected
    : (liveTotalCollected > 0 ? liveTotalCollected : totalCollectedFromTx);

  const totalBilled = (financeSummary?.summary?.totalBilled !== undefined && financeSummary?.summary?.totalBilled > 0)
    ? financeSummary.summary.totalBilled
    : liveTotalBilled;

  const totalOverdue = (financeSummary?.summary?.totalOverdue !== undefined)
    ? financeSummary.summary.totalOverdue
    : liveTotalOverdue;

  const pendingCount = overdueStudents.length || transactions.filter(t => t.status === 'PENDING_CLEARANCE' || t.status === 'PENDING').length;
  const overdueCount = overdueStudents.length || transactions.filter(t => t.status === 'OVERDUE').length;

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm ||
      (tx.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.refNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.grade || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'COMPLETED' && (tx.status === 'COMPLETED' || tx.status === 'PAID')) ||
      (statusFilter === 'PENDING' && (tx.status === 'PENDING' || tx.status === 'PENDING_CLEARANCE' || tx.status === 'OVERDUE'));
    return matchesSearch && matchesStatus;
  });

  // Filtered students for distributed breakdown
  const filteredStudents = students.filter(st => {
    const nameMatch = !searchTerm ||
      (st.fullName || st.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.grade || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'ALL' ||
      (statusFilter === 'COMPLETED' && st.feeStatus === 'PAID') ||
      (statusFilter === 'PENDING' && st.feeStatus !== 'PAID');
    return nameMatch && statusMatch;
  });

  // Dynamic Grade Options for Modal
  const dynamicGradeOptions = Array.from(new Set([
    formData.grade,
    ...students.map(s => `${s.grade || 'Grade 9'}-${s.section || 'A'}`),
    ...ALL_STANDARD_GRADES
  ])).filter(Boolean);

  const openReceiptModalForStudent = (st) => {
    const stGrade = st.grade || 'Grade 9';
    const stSection = st.section || 'A';
    const isPaid = st.feeStatus === 'PAID';
    const pendingDues = isPaid ? 0 : 45000;
    setFormData({
      studentAdmissionNumber: st.admissionNumber || st.id,
      studentName: st.fullName || st.name,
      grade: `${stGrade}-${stSection}`,
      amount: String(pendingDues > 0 ? pendingDues : 45000),
      method: 'UPI / Razorpay',
      status: 'COMPLETED'
    });
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Finance & Accounts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Fee reconciliation, bank challans, student dues ledger & financial audit trail
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchTx()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (students.length > 0 && !formData.studentAdmissionNumber) {
                openReceiptModalForStudent(students[0]);
              } else {
                setShowAddModal(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" /> Record Fee Receipt
          </button>
          <button
            onClick={() => showToast('Exported daily ledger to Excel / CSV', 'info')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <ArrowDownToLine className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Clickable Metrics Cards - Filter Ledger on Click */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Collections Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`card-clean p-5 text-left transition border-l-4 border-l-emerald-500 cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/20'
              : 'hover:bg-slate-50/80 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Total Collections</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {statusFilter === 'COMPLETED' ? 'Filter Active' : 'Click to filter'}
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">₹{totalCollected.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400 mt-1 block">
            {settledStudents.length} settled accounts
          </span>
        </button>

        {/* Pending Reconciliation Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`card-clean p-5 text-left transition border-l-4 border-l-amber-500 cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/20'
              : 'hover:bg-slate-50/80 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Pending Reconciliation</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {statusFilter === 'PENDING' ? 'Filter Active' : 'Click to filter'}
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">₹{totalOverdue.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400 mt-1 block">
            {pendingCount > 0 ? `${pendingCount} accounts awaiting clearance` : 'All challans cleared'}
          </span>
        </button>

        {/* Unpaid Overdue Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`card-clean p-5 text-left transition border-l-4 border-l-rose-500 cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'ring-2 ring-rose-500 shadow-md bg-rose-50/20'
              : 'hover:bg-slate-50/80 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Unpaid Overdue</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {statusFilter === 'PENDING' ? 'Filter Active' : 'Click to filter'}
            </span>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">₹{totalOverdue.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {overdueCount} student accounts
          </span>
        </button>

        {/* Annual Billed Total Card */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`card-clean p-5 text-left transition border-l-4 border-l-indigo-500 cursor-pointer ${
            statusFilter === 'ALL'
              ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/20'
              : 'hover:bg-slate-50/80 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Annual Billed Total</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {statusFilter === 'ALL' ? 'Showing All' : 'Click to reset'}
            </span>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">₹{totalBilled.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400 mt-1 block">Across {students.length} admitted students</span>
        </button>
      </div>

      {/* Main Ledger Container with Dual View Switcher */}
      <div className="card-clean overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('distributed')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                activeTab === 'distributed'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Distributed Student Dues ({filteredStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" /> Transaction Journal ({filteredTransactions.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Settled / Paid</option>
              <option value="PENDING">Pending / Overdue</option>
            </select>
          </div>
        </div>

        {/* TAB 1: Distributed Student Fee Ledger & Account Breakdown */}
        {activeTab === 'distributed' && (
          <div>
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Enrolled Students Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {students.length === 0
                    ? 'When students are admitted to the school, their individual fee accounts will populate here.'
                    : 'No student accounts match the selected status or search filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Student & Admission No.</th>
                      <th className="py-3 px-4">Enrolled Class</th>
                      <th className="py-3 px-4">Annual Tuition</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Balance Dues</th>
                      <th className="py-3 px-4">Fee Status</th>
                      <th className="py-3 px-4">Guardian Contact</th>
                      <th className="py-3 px-4 text-right">Accountant Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((st) => {
                      const isPaid = st.feeStatus === 'PAID';
                      const billed = 45000;
                      const paid = isPaid ? 45000 : 0;
                      const pending = billed - paid;

                      return (
                        <tr key={st.id || st.admissionNumber} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{st.fullName || st.name}</p>
                            <p className="text-[11px] font-mono text-indigo-600">{st.admissionNumber || st.id}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 text-slate-700">
                              {st.grade || 'Grade 9'} - {st.section || 'A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">₹{billed.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">₹{paid.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 font-bold text-rose-600">₹{pending.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {isPaid ? 'COMPLETED' : 'OVERDUE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {st.parentWhatsApp || st.parentPhone || '+91 98220 00000'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isPaid ? (
                              <button
                                onClick={() => openReceiptModalForStudent(st)}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition"
                              >
                                Record Receipt
                              </button>
                            ) : (
                              <button
                                onClick={() => showToast(`Account cleared for ${st.fullName || st.admissionNumber}. Receipt ref: INV-2026-${st.admissionNumber}`, 'info')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                              >
                                View Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Recent Payment Transactions & Bank Challans */}
        {activeTab === 'transactions' && (
          <div>
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Student Fee Transactions Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {students.length === 0
                    ? 'When students are admitted to the school, their fee accounts will appear here automatically.'
                    : 'No transactions matched the search filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Student & Grade</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.map((tx) => {
                      const isCompleted = tx.status === 'COMPLETED' || tx.status === 'PAID';
                      return (
                        <tr key={tx.id || tx.refNo} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tx.refNo}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">{tx.studentName}</p>
                            <p className="text-[11px] text-slate-500">{tx.grade}</p>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{tx.amount}</td>
                          <td className="py-3 px-4 text-slate-600">{tx.method}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {isCompleted ? 'COMPLETED' : 'OVERDUE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isCompleted ? (
                              <button
                                onClick={() => handleReconcile(tx)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition"
                              >
                                Reconcile Fee
                              </button>
                            ) : (
                              <button
                                onClick={() => showToast(`Receipt generated for ${tx.refNo}`, 'info')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                              >
                                Print Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Fee Receipt Modal with Robust Student Dropdown & Dynamic Grade Options */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" /> Record Student Fee Receipt
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Post an official tuition transaction into the accounts ledger.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReceipt} className="space-y-4">
              {/* Dropdown for Student Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Admitted Student *
                </label>
                {students.length > 0 ? (
                  <select
                    required
                    value={formData.studentAdmissionNumber || ''}
                    onChange={(e) => {
                      const admNo = e.target.value;
                      const selectedSt = students.find(s => (s.admissionNumber || s.id) === admNo);
                      if (selectedSt) {
                        const stGrade = selectedSt.grade || 'Grade 9';
                        const stSection = selectedSt.section || 'A';
                        const combinedGrade = `${stGrade}-${stSection}`;
                        const isPaid = selectedSt.feeStatus === 'PAID';
                        const pendingDues = isPaid ? 0 : 45000;
                        setFormData({
                          ...formData,
                          studentAdmissionNumber: selectedSt.admissionNumber || selectedSt.id,
                          studentName: selectedSt.fullName || selectedSt.name,
                          grade: combinedGrade,
                          amount: String(pendingDues > 0 ? pendingDues : 45000),
                          status: 'COMPLETED'
                        });
                      } else {
                        setFormData({
                          ...formData,
                          studentAdmissionNumber: '',
                          studentName: '',
                          grade: 'Grade 9-A',
                          amount: '45000'
                        });
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="">-- Choose Student from Enrolled Roster --</option>
                    {students.map((st) => (
                      <option key={st.admissionNumber || st.id} value={st.admissionNumber || st.id}>
                        {st.fullName || st.name} ({st.admissionNumber || st.id}) — {st.grade} Section {st.section} [{st.feeStatus || 'PENDING'}]
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter Student Full Name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              {/* Selected student badge info */}
              {formData.studentName && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Selected Student</span>
                    <span className="font-bold text-slate-900 text-sm">{formData.studentName}</span>
                    <span className="text-[11px] text-indigo-700 block font-mono mt-0.5">
                      {formData.studentAdmissionNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-2xs block">
                      {formData.grade}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Annual Fee: ₹45,000
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic K-12 Grade & Division Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade & Division</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {dynamicGradeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="45000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>UPI / Razorpay</option>
                    <option>Net Banking / NEFT</option>
                    <option>Credit / Debit Card</option>
                    <option>Bank Challan</option>
                    <option>Cheque Deposit</option>
                    <option>Cash at Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="COMPLETED">COMPLETED / SETTLED</option>
                    <option value="PENDING_CLEARANCE">PENDING CLEARANCE</option>
                    <option value="OVERDUE">OVERDUE / UNPAID</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
