import { FeeTransaction } from '../models/FeeTransaction.js';
import { Student } from '../models/Student.js';

export class FinanceService {
  static async getFeeLedger(institutionId) {
    const [transactions, students] = await Promise.all([
      FeeTransaction.find({ institutionId }).sort({ transactionDate: -1 }).lean(),
      Student.find({ institutionId }).lean()
    ]);

    // Ensure every admitted student is represented in the institutional fee ledger
    const existingStudentAdms = new Set(transactions.map(t => t.studentAdmissionNumber).filter(Boolean));
    const pendingStudents = students.filter(s => !existingStudentAdms.has(s.admissionNumber));

    // For any admitted student without a transaction, synthesize/reconcile their account
    const studentRecords = pendingStudents.map(s => {
      const isPaid = s.feePaymentStatus === 'PAID';
      return {
        _id: s._id.toString(),
        studentAdmissionNumber: s.admissionNumber,
        studentName: s.fullName,
        gradeDivision: `${s.grade || 'Grade 1'}-${s.section || 'A'}`,
        parentName: s.parentName || 'Parent Guardian',
        parentPhone: s.parentWhatsApp || '',
        invoiceNumber: `INV-2026-${s.admissionNumber}`,
        challanReference: `REF-${s.admissionNumber}`,
        amountBilled: 45000,
        amountPaid: isPaid ? 45000 : 0,
        pendingAmount: isPaid ? 0 : 45000,
        status: isPaid ? 'PAID' : (s.feePaymentStatus || 'OVERDUE'),
        paymentMethod: isPaid ? 'Online Gateway' : 'Bank Challan',
        transactionDate: s.admissionDate || new Date()
      };
    });

    const allRecords = [...transactions, ...studentRecords];

    const totalBilled = allRecords.reduce((acc, t) => acc + (t.amountBilled || 45000), 0);
    const totalCollected = allRecords.reduce((acc, t) => acc + (t.amountPaid || 0), 0);
    const totalOverdue = totalBilled - totalCollected;

    const clearedCount = allRecords.filter(t => t.status === 'PAID' || t.status === 'COMPLETED').length;
    const partialCount = allRecords.filter(t => t.status === 'PARTIAL').length;
    const overdueCount = allRecords.filter(t => t.status !== 'PAID' && t.status !== 'COMPLETED').length;

    const defaulters = allRecords
      .filter(t => t.status !== 'PAID' && t.status !== 'COMPLETED')
      .map(t => ({
        transactionId: t._id ? t._id.toString() : t.id,
        invoiceNumber: t.invoiceNumber || `INV-2026-${t.studentAdmissionNumber}`,
        admissionNumber: t.studentAdmissionNumber,
        studentName: t.studentName || 'Student',
        gradeDivision: t.gradeDivision || 'Grade 1-A',
        parentName: t.parentName || 'Parent Guardian',
        parentPhone: t.parentPhone || '+91 98220 00000',
        amountBilled: t.amountBilled || 45000,
        amountPaid: t.amountPaid || 0,
        pendingAmount: t.pendingAmount !== undefined ? t.pendingAmount : 45000,
        status: t.status || 'OVERDUE',
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
      transactions: allRecords.map(t => ({
        id: t._id ? t._id.toString() : t.id,
        _id: t._id ? t._id.toString() : t.id,
        refNo: t.transactionRef || t.challanReference || t.invoiceNumber || `PAY-${(t._id ? t._id.toString() : '2026').substring(0, 8).toUpperCase()}`,
        studentAdmissionNumber: t.studentAdmissionNumber,
        studentName: t.studentName || 'Student',
        grade: t.gradeDivision || t.academicYear || 'Grade 1-A',
        amount: `₹${(t.amountBilled || 45000).toLocaleString('en-IN')}`,
        rawAmount: t.amountBilled || 45000,
        amountBilled: t.amountBilled || 45000,
        amountPaid: t.amountPaid || 0,
        pendingAmount: t.pendingAmount !== undefined ? t.pendingAmount : (t.status === 'PAID' || t.status === 'COMPLETED' ? 0 : 45000),
        method: t.paymentMethod || 'Bank Challan',
        status: t.status === 'PAID' || t.status === 'COMPLETED' ? 'COMPLETED' : (t.status || 'PENDING_CLEARANCE'),
        date: t.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '2026-09-01'
      }))
    };
  }

  static async reconcileChallan(transactionId, { amount, challanRef, method }) {
    let tx = await FeeTransaction.findById(transactionId);
    if (!tx) {
      // Check if transactionId is student admission number or invoice number
      tx = await FeeTransaction.findOne({
        $or: [
          { invoiceNumber: transactionId },
          { challanReference: transactionId },
          { studentAdmissionNumber: transactionId }
        ]
      });
    }

    if (!tx) {
      // If student exists, create the transaction
      const st = await Student.findOne({
        $or: [
          { _id: transactionId.match(/^[0-9a-fA-F]{24}$/) ? transactionId : null },
          { admissionNumber: transactionId }
        ].filter(Boolean)
      });

      if (st) {
        tx = await FeeTransaction.create({
          institutionId: st.institutionId,
          studentAdmissionNumber: st.admissionNumber,
          studentName: st.fullName,
          gradeDivision: `${st.grade}-${st.section}`,
          parentName: st.parentName,
          parentPhone: st.parentWhatsApp,
          invoiceNumber: `INV-2026-${st.admissionNumber}`,
          challanReference: challanRef || `CHALLAN-${Date.now()}`,
          amountBilled: 45000,
          amountPaid: Number(amount) || 45000,
          pendingAmount: Math.max(0, 45000 - (Number(amount) || 45000)),
          paymentMethod: method || 'Bank Challan',
          status: 'PAID',
          transactionDate: new Date()
        });

        st.feePaymentStatus = 'PAID';
        await st.save();
        return tx;
      }

      throw { statusCode: 404, code: 'TX_NOT_FOUND', message: 'Transaction record not found in MongoDB.' };
    }

    const newPaid = tx.amountPaid + Number(amount || tx.amountBilled);
    const newPending = Math.max(0, tx.amountBilled - newPaid);
    const newStatus = newPending === 0 ? 'PAID' : 'PARTIAL';

    tx.amountPaid = newPaid;
    tx.pendingAmount = newPending;
    tx.status = newStatus;
    if (challanRef) tx.challanReference = challanRef;
    if (method) tx.paymentMethod = method;
    tx.transactionDate = new Date();

    await tx.save();

    if (newStatus === 'PAID') {
      await Student.updateOne(
        { institutionId: tx.institutionId, admissionNumber: tx.studentAdmissionNumber },
        { feePaymentStatus: 'PAID' }
      );
    }

    return tx;
  }
}
export default FinanceService;
