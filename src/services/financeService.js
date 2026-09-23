import { FeeTransaction } from '../models/FeeTransaction.js';
import { Student } from '../models/Student.js';

export class FinanceService {
  static async getFeeLedger(institutionId) {
    const transactions = await FeeTransaction.find({ institutionId })
      .sort({ transactionDate: -1 })
      .lean();

    const totalBilled = transactions.reduce((acc, t) => acc + (t.amountBilled || 45000), 0);
    const totalCollected = transactions.reduce((acc, t) => acc + (t.amountPaid || 0), 0);
    const totalOverdue = totalBilled - totalCollected;

    const clearedCount = transactions.filter(t => t.status === 'PAID').length;
    const partialCount = transactions.filter(t => t.status === 'PARTIAL').length;
    const overdueCount = transactions.filter(t => t.status === 'OVERDUE').length;

    const defaulters = transactions
      .filter(t => t.status !== 'PAID')
      .map(t => ({
        transactionId: t._id.toString(),
        invoiceNumber: t.invoiceNumber,
        admissionNumber: t.studentAdmissionNumber,
        studentName: t.studentName || 'Student',
        gradeDivision: t.gradeDivision || 'Grade 9-A',
        parentName: t.parentName || 'Parent Guardian',
        parentPhone: t.parentPhone || '+91 98220 00000',
        amountBilled: t.amountBilled,
        amountPaid: t.amountPaid,
        pendingAmount: t.pendingAmount,
        status: t.status,
        agingDays: t.status === 'OVERDUE' ? 45 : 15
      }));

    return {
      summary: {
        totalBilled,
        totalCollected,
        totalOverdue,
        clearedCount,
        partialCount,
        overdueCount,
        collectionRatePercent: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 1000) / 10 : 0
      },
      defaulters,
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        invoiceNumber: t.invoiceNumber,
        studentName: t.studentName || 'Student',
        classDivision: t.gradeDivision || 'Grade 9-A',
        amountPaid: t.amountPaid,
        paymentMethod: t.paymentMethod,
        challanRef: t.challanReference || 'N/A',
        status: t.status,
        date: t.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '2026-09-01'
      }))
    };
  }

  static async reconcileChallan(transactionId, { amount, challanRef, method }) {
    const tx = await FeeTransaction.findById(transactionId);
    if (!tx) {
      throw { statusCode: 404, code: 'TX_NOT_FOUND', message: 'Transaction record not found in MongoDB.' };
    }

    const newPaid = tx.amountPaid + Number(amount);
    const newPending = Math.max(0, tx.amountBilled - newPaid);
    const newStatus = newPending === 0 ? 'PAID' : 'PARTIAL';

    tx.amountPaid = newPaid;
    tx.pendingAmount = newPending;
    tx.status = newStatus;
    if (challanRef) tx.challanReference = challanRef;
    if (method) tx.paymentMethod = method;
    tx.transactionDate = new Date();

    await tx.save();
    return tx;
  }
}
export default FinanceService;
