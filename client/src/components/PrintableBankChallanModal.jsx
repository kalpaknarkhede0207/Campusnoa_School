import React, { useRef } from 'react';
import { X, Printer, Download, CreditCard, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrintableBankChallanModal({ isOpen, onClose, studentData, feeData }) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const student = studentData || {
    name: 'Aarav Sharma',
    admissionNo: '24755',
    rollNo: '14',
    grade: 'Grade 4-B',
    fatherName: 'Vikram Sharma',
    phone: '+91 98230 44110'
  };

  const fees = feeData || {
    tuitionFee: 18500,
    transportFee: 4200,
    activityFee: 1200,
    examFee: 600,
    lateFee: 0,
    netPayable: 24500,
    dueDate: '10-Dec-2026',
    challanNo: 'CHL-2026-0891',
    session: '2026–2027',
    installment: 'Term 2 Installment'
  };

  const bankInfo = {
    bankName: 'HDFC BANK LTD (COLLECTION A/C)',
    accountNo: '50200047666642',
    ifsc: 'HDFC0001248',
    branch: 'Knowledge Park Branch, Pune',
    code: 'CBSE-COL-091'
  };

  const handlePrint = () => {
    window.print();
  };

  // Reusable Single Challan Copy Sub-component
  const ChallanCopy = ({ copyTitle, isLast }) => (
    <div className={`p-4 bg-white border border-slate-300 rounded-lg flex flex-col justify-between text-[11px] leading-tight print:border-slate-800 print:text-[10px] print:p-2.5 ${!isLast ? 'border-r-2 border-dashed border-r-slate-400' : ''}`}>
      <div>
        {/* Copy Tag */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
          <span className="font-extrabold uppercase tracking-wider text-indigo-900 print:text-black">
            CampusNoa ERP
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-300 print:border-black">
            {copyTitle}
          </span>
        </div>

        {/* Bank & School Details */}
        <div className="bg-slate-50 p-2 rounded border border-slate-200 mb-2 print:bg-white print:border-slate-400">
          <p className="font-bold text-slate-900 text-center">{bankInfo.bankName}</p>
          <div className="grid grid-cols-2 gap-x-2 mt-1 text-[10px] text-slate-600 print:text-black">
            <p><span className="font-semibold">A/C No:</span> {bankInfo.accountNo}</p>
            <p><span className="font-semibold">IFSC:</span> {bankInfo.ifsc}</p>
            <p><span className="font-semibold">Challan Ref:</span> {fees.challanNo}</p>
            <p><span className="font-semibold">Due Date:</span> {fees.dueDate}</p>
          </div>
        </div>

        {/* Student Particulars */}
        <div className="space-y-0.5 border-b border-slate-200 pb-1.5 mb-2 print:text-[10px]">
          <p><span className="font-semibold text-slate-700">Student Name:</span> <strong className="text-slate-900">{student.name}</strong></p>
          <div className="grid grid-cols-2 gap-x-1">
            <p><span className="font-semibold text-slate-700">Adm No:</span> {student.admissionNo}</p>
            <p><span className="font-semibold text-slate-700">Class:</span> {student.grade}</p>
            <p><span className="font-semibold text-slate-700">Roll No:</span> {student.rollNo}</p>
            <p><span className="font-semibold text-slate-700">Session:</span> {fees.session}</p>
          </div>
          <p><span className="font-semibold text-slate-700">Parent Name:</span> {student.fatherName}</p>
        </div>

        {/* Fee Particulars Table */}
        <table className="w-full text-left border-collapse mb-2">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100 print:bg-slate-200">
              <th className="py-1 px-1 font-bold text-slate-700">Fee Particulars</th>
              <th className="py-1 px-1 font-bold text-slate-700 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-0.5 px-1">Tuition Fee ({fees.installment})</td>
              <td className="py-0.5 px-1 text-right font-mono">{fees.tuitionFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-0.5 px-1">School Transport / Bus Fee</td>
              <td className="py-0.5 px-1 text-right font-mono">{fees.transportFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-0.5 px-1">Activity & Technology Fee</td>
              <td className="py-0.5 px-1 text-right font-mono">{fees.activityFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-0.5 px-1">Exam & Evaluation Fee</td>
              <td className="py-0.5 px-1 text-right font-mono">{fees.examFee.toLocaleString('en-IN')}</td>
            </tr>
            {fees.lateFee > 0 && (
              <tr className="text-rose-600">
                <td className="py-0.5 px-1">Late Fine Penalty</td>
                <td className="py-0.5 px-1 text-right font-mono">{fees.lateFee.toLocaleString('en-IN')}</td>
              </tr>
            )}
            <tr className="border-t-2 border-slate-400 font-bold bg-slate-50">
              <td className="py-1 px-1">NET PAYABLE AMOUNT:</td>
              <td className="py-1 px-1 text-right font-mono text-indigo-700 print:text-black">
                ₹{fees.netPayable.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Cash Denomination Grid */}
        <div className="border border-slate-200 rounded p-1 mb-2">
          <p className="font-bold text-[9px] uppercase tracking-wider text-slate-600 mb-0.5">Cash Denomination</p>
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
            <span>500 x ___</span>
            <span>200 x ___</span>
            <span>100 x ___</span>
            <span>50 x ___</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px] mt-1 text-slate-500">
            <p>Cheque No: ____________</p>
            <p>Bank: ____________</p>
          </div>
        </div>
      </div>

      {/* Signature & Seal Blocks */}
      <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-[9px] text-center text-slate-600">
        <div>
          <div className="h-6 border-b border-dashed border-slate-300" />
          <p className="mt-0.5">Depositor's Sign</p>
        </div>
        <div>
          <div className="h-6 border-b border-dashed border-slate-300" />
          <p className="mt-0.5">Cashier / Bank Seal</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-8 flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">3-Copy Official Bank Challan</h3>
              <p className="text-xs text-slate-500">Parent Copy • School Copy • Bank Copy (Cash / Cheque collection format)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable 3-Copy Area */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/50" ref={printRef}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-1">
            <ChallanCopy copyTitle="Parent Copy" isLast={false} />
            <ChallanCopy copyTitle="School Copy" isLast={false} />
            <ChallanCopy copyTitle="Bank Copy" isLast={true} />
          </div>

          {/* Guidelines footer */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2 print:hidden">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Instructions for Depositors:</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Present all three copies intact at any designated HDFC / State Bank branch. The receiving cashier will retain the Bank Copy and stamp both School and Parent copies. Return the stamped School Copy to the accounts desk or upload the receipt in the Parent Portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
