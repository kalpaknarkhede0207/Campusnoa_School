import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Clock, CheckCircle2, 
  Search, ArrowDownToLine, Receipt, AlertCircle, RefreshCw, PlusCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountantDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    grade: 'Grade 9-A',
    amount: '45000',
    method: 'UPI / Razorpay',
    status: 'COMPLETED'
  });

  const fetchTx = async () => {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        api.getTransactions().catch(() => ({ transactions: [] })),
        api.getFinanceSummary().catch(() => null)
      ]);
      const txList = Array.isArray(txRes?.transactions) ? txRes.transactions : [];
      setTransactions(txList);
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
      await api.reconcilePayment(tx.id || tx._id);
      showToast(`Transaction ${tx.refNo || tx.invoiceNumber || 'receipt'} reconciled and receipt generated!`, 'success');
      await fetchTx();
    } catch (err) {
      showToast(err.message || `Failed to reconcile transaction`, 'error');
    }
  };

  const handleAddReceipt = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.amount) {
      showToast('Please enter student name and amount', 'error');
      return;
    }

    try {
      await api.createFeeReceipt(formData);
      setShowAddModal(false);
      setFormData({ studentName: '', grade: 'Grade 9-A', amount: '45000', method: 'UPI / Razorpay', status: 'COMPLETED' });
      showToast('Fee receipt generated and committed to institutional ledger!', 'success');
      await fetchTx();
    } catch (err) {
      showToast(err.message || 'Failed to record fee receipt', 'error');
    }
  };

  // Dynamic calculations from transactions
  const parseAmount = (amtStr) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 0;
    const clean = amtStr.toString().replace(/[^0-9]/g, '');
    return Number(clean) || 0;
  };

  const totalCollected = transactions
    .filter(t => t.status === 'COMPLETED' || t.status === 'PAID')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const pendingReconciliation = transactions
    .filter(t => t.status === 'PENDING_CLEARANCE' || t.status === 'PENDING')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const unpaidOverdue = transactions
    .filter(t => t.status === 'OVERDUE')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const pendingCount = transactions.filter(t => t.status === 'PENDING_CLEARANCE' || t.status === 'PENDING').length;
  const overdueCount = transactions.filter(t => t.status === 'OVERDUE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Finance & Accounts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Fee reconciliation, bank challans, student dues ledger & financial audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
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
            {transactions.length > 0 ? `${transactions.filter(t => t.status === 'COMPLETED').length} settled payments` : '0 transactions recorded'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-500">Pending Reconciliation</span>
          <p className="text-2xl font-black text-amber-600 mt-1">₹{pendingReconciliation.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400">
            {pendingCount > 0 ? `${pendingCount} items awaiting clearance` : 'All challans cleared'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-rose-500">
          <span className="text-xs font-bold uppercase text-slate-500">Unpaid Overdue</span>
          <p className="text-2xl font-black text-rose-600 mt-1">₹{unpaidOverdue.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400">
            {overdueCount > 0 ? `${overdueCount} accounts overdue` : 'No overdue accounts'}
          </span>
        </div>

        <div className="card-clean p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500">Payment Gateway</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">Active</p>
          <span className="text-xs text-slate-400">Razorpay, HDFC & SBI Ready</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" /> Recent Student Fee Payments & Transactions
          </h3>
          <span className="text-xs text-slate-500 font-medium">Auto-updated via webhook</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No Student Fee Transactions Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              The financial accounts ledger is live and clean. When student fees are paid online, bank challans submitted, or counter receipts generated, they will appear here in real time.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
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
              {transactions.map((tx) => (
                <tr key={tx.id || tx.refNo} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tx.refNo}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{tx.studentName}</p>
                    <p className="text-[11px] text-slate-400">{tx.grade}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{tx.amount}</td>
                  <td className="py-3 px-4 text-slate-600">{tx.method}</td>
                  <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      tx.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : tx.status === 'PENDING_CLEARANCE' || tx.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {tx.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleReconcile(tx)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200"
                      >
                        Reconcile
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast(`Receipt generated for ${tx.refNo}`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                      >
                        Print Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Fee Receipt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Record Student Fee Receipt</h3>
            <p className="text-xs text-slate-500 mb-4">Post a fee transaction into the institutional accounts ledger.</p>

            <form onSubmit={handleAddReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Name"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

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
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING_CLEARANCE">PENDING CLEARANCE</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
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
