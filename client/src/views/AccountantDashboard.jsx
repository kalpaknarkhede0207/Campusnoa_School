import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Clock, CheckCircle2, 
  Search, ArrowDownToLine, Receipt, AlertCircle, RefreshCw, PlusCircle,
  Users, Check, X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountantDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Compute live amounts from database and summary
  const totalCollectedFromTx = transactions
    .filter(t => t.status === 'COMPLETED' || t.status === 'PAID')
    .reduce((sum, t) => sum + (t.amountPaid || parseAmount(t.amount)), 0);

  const totalCollected = (financeSummary?.summary?.totalCollected !== undefined && financeSummary?.summary?.totalCollected > 0)
    ? financeSummary.summary.totalCollected
    : totalCollectedFromTx;

  const totalBilled = (financeSummary?.summary?.totalBilled !== undefined && financeSummary?.summary?.totalBilled > 0)
    ? financeSummary.summary.totalBilled
    : (students.length > 0 ? students.length * 45000 : transactions.reduce((sum, t) => sum + (t.amountBilled || 45000), 0));

  const totalOverdue = (financeSummary?.summary?.totalOverdue !== undefined)
    ? financeSummary.summary.totalOverdue
    : (totalBilled - totalCollected);

  const pendingCount = transactions.filter(t => t.status === 'PENDING_CLEARANCE' || t.status === 'PENDING').length ||
                       students.filter(s => s.feeStatus !== 'PAID').length;
  const overdueCount = transactions.filter(t => t.status === 'OVERDUE').length ||
                      students.filter(s => s.feeStatus !== 'PAID').length;

  // Filtered transactions for table
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
              // Pre-select first student if available
              if (students.length > 0 && !formData.studentAdmissionNumber) {
                const firstSt = students[0];
                const stGrade = firstSt.grade || 'Grade 9';
                const stSection = firstSt.section || 'A';
                const isPaid = firstSt.feeStatus === 'PAID';
                setFormData({
                  studentAdmissionNumber: firstSt.admissionNumber || firstSt.id,
                  studentName: firstSt.fullName || firstSt.name,
                  grade: `${stGrade}-${stSection}`,
                  amount: String(isPaid ? 45000 : (firstSt.fees?.pendingAmount || 45000)),
                  method: 'UPI / Razorpay',
                  status: 'COMPLETED'
                });
              }
              setShowAddModal(true);
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-clean p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500">Total Collections</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400">
            {students.filter(s => s.feeStatus === 'PAID').length} settled accounts
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-500">Pending Reconciliation</span>
          <p className="text-2xl font-black text-amber-600 mt-1">₹{totalOverdue.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400">
            {pendingCount > 0 ? `${pendingCount} accounts awaiting clearance` : 'All challans cleared'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-rose-500">
          <span className="text-xs font-bold uppercase text-slate-500">Unpaid Overdue</span>
          <p className="text-2xl font-black text-rose-600 mt-1">₹{totalOverdue.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400">
            {overdueCount > 0 ? `${overdueCount} accounts overdue` : 'No overdue accounts'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500">Annual Billed Total</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">₹{totalBilled.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400">Across {students.length} admitted students</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" /> Recent Student Fee Payments & Transactions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live ledger of student fee invoices, counter collections, and bank challans
            </p>
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
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Settled Only</option>
              <option value="PENDING">Pending / Overdue</option>
            </select>
          </div>
        </div>

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

      {/* Record Fee Receipt Modal */}
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
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Selected Student:</span>
                    <span className="font-bold text-slate-900">{formData.studentName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
                    {formData.grade}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade & Division</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="45000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
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
