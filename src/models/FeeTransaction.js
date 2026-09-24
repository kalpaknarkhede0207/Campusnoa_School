import mongoose from 'mongoose';

const FeeTransactionSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  studentAdmissionNumber: { type: String, required: true, index: true },
  studentName: { type: String },
  gradeDivision: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  amountBilled: { type: Number, default: 45000 },
  amountPaid: { type: Number, default: 45000 },
  pendingAmount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    default: 'BANK_TRANSFER'
  },
  challanReference: { type: String },
  status: {
    type: String,
    default: 'PAID',
    enum: ['PAID', 'PARTIAL', 'OVERDUE', 'WAIVED', 'PENDING', 'COMPLETED', 'PENDING_CLEARANCE'],
    index: true
  },
  transactionDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const FeeTransaction = mongoose.models.FeeTransaction || mongoose.model('FeeTransaction', FeeTransactionSchema);
export default FeeTransaction;
