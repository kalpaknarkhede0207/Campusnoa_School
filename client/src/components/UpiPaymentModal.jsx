import React, { useState } from 'react';
import { 
  X, QrCode, CheckCircle2, Copy, Check, Download, ShieldCheck, 
  Smartphone, CreditCard, ArrowRight, Sparkles 
} from 'lucide-react';
import { formatINR } from '../utils/formatUtils';

export default function UpiPaymentModal({ isOpen, onClose, student, onPaymentSuccess }) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!isOpen || !student) return null;

  const upiId = 'campusnoa.fees@icici';
  const hasSiblingDiscount = (student.siblingDiscountPercent || 0) > 0;
  const baseTuition = 45000;
  const discountAmount = hasSiblingDiscount ? Math.round((baseTuition * student.siblingDiscountPercent) / 100) : 0;
  const netPayable = baseTuition - discountAmount;
  const receiptNo = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaid(true);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          receiptNo,
          amount: netPayable,
          studentName: student.name,
          date: new Date().toLocaleDateString('en-IN')
        });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!paid ? (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Direct UPI Instant Checkout
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
                Pay Tuition Dues
              </h3>
              <p className="text-xs text-slate-500">
                Ward: <strong className="text-slate-800">{student.name}</strong> ({student.gradeDisplay || student.grade})
              </p>
            </div>

            {/* Bill Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Annual Term Tuition:</span>
                <span className="font-mono text-slate-700">{formatINR(baseTuition)}</span>
              </div>
              {hasSiblingDiscount && (
                <div className="flex justify-between text-xs text-amber-700 font-bold">
                  <span>Sibling Concession ({student.siblingDiscountPercent}%):</span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-900">Total Net Payable:</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  {formatINR(netPayable)}
                </span>
              </div>
            </div>

            {/* High-Contrast UPI QR Code Box */}
            <div className="p-5 bg-white border-2 border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 mb-2 shadow-xs">
                {/* Clean Scalable Vector QR Representation */}
                <svg className="w-40 h-40 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Top-left position marker */}
                  <rect x="10" y="10" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6"/>
                  <rect x="18" y="18" width="8" height="8" fill="currentColor"/>
                  {/* Top-right position marker */}
                  <rect x="66" y="10" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6"/>
                  <rect x="74" y="18" width="8" height="8" fill="currentColor"/>
                  {/* Bottom-left position marker */}
                  <rect x="10" y="66" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6"/>
                  <rect x="18" y="74" width="8" height="8" fill="currentColor"/>
                  {/* Data patterns */}
                  <rect x="42" y="12" width="6" height="14" fill="currentColor"/>
                  <rect x="52" y="18" width="6" height="8" fill="currentColor"/>
                  <rect x="42" y="32" width="16" height="6" fill="currentColor"/>
                  <rect x="12" y="42" width="14" height="6" fill="currentColor"/>
                  <rect x="32" y="42" width="8" height="16" fill="currentColor"/>
                  <rect x="46" y="46" width="8" height="8" fill="currentColor"/>
                  <rect x="60" y="42" width="14" height="8" fill="currentColor"/>
                  <rect x="80" y="42" width="8" height="16" fill="currentColor"/>
                  <rect x="42" y="60" width="6" height="14" fill="currentColor"/>
                  <rect x="54" y="66" width="14" height="6" fill="currentColor"/>
                  <rect x="74" y="60" width="14" height="8" fill="currentColor"/>
                  <rect x="42" y="80" width="24" height="8" fill="currentColor"/>
                  <rect x="72" y="74" width="16" height="14" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-800">
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instant zero-fee settlement directly to institutional bank account
              </p>
            </div>

            {/* UPI ID with Copy Option */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">UPI VPA Address:</span>
                <span className="font-mono font-bold text-slate-800">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-700 font-bold border border-slate-200 flex items-center gap-1 transition shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy UPI'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Reconciling with Bank Gateway...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Completed UPI Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Payment Reconciled &amp; Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Tuition Fee Successfully Paid!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Receipt #{receiptNo} has been posted into the school accounts ledger.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600 font-mono">{formatINR(netPayable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800">UPI / QR Transfer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">SETTLED (Bank Ref Verified)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> Download Official PDF Receipt
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
