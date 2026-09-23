import express from 'express';
import { FinanceService } from '../services/financeService.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { enforceTenantScope } from '../middlewares/tenantScope.js';
import { requireRoles } from '../middlewares/authorize.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { FeeTransaction } from '../models/FeeTransaction.js';
import { Student } from '../models/Student.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantScope);

// 1. GET Fee Summary
router.get('/summary', async (req, res, next) => {
  try {
    const data = await FinanceService.getFeeLedger(req.institutionId);
    res.json({
      success: true,
      totalCollected: data.summary?.totalCollected || 0,
      totalPending: data.summary?.totalOverdue || 0,
      collectionRate: data.summary?.collectionRatePercent || 0,
      ...data
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET Transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const txs = await FeeTransaction.find({ institutionId: req.institutionId }).sort({ transactionDate: -1 }).limit(100).lean();
    const formatted = txs.map(t => ({
      id: t._id.toString(),
      _id: t._id.toString(),
      refNo: t.transactionRef || `PAY-${t._id.toString().substring(0, 8).toUpperCase()}`,
      studentName: t.studentName,
      grade: t.academicYear || 'Grade 9-A',
      amount: `₹${(t.amountPaid || t.amountBilled || 45000).toLocaleString('en-IN')}`,
      method: t.paymentMethod || 'Online Transfer',
      date: t.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '2026-03-22',
      status: t.status === 'PAID' ? 'COMPLETED' : t.status
    }));
    res.json({ success: true, transactions: formatted });
  } catch (err) {
    next(err);
  }
});

// 3. GET Homeroom Fee Ledger
router.get('/homeroom', async (req, res, next) => {
  try {
    const txs = await FeeTransaction.find({ institutionId: req.institutionId }).limit(10).lean();
    res.json({ success: true, homeroom: txs });
  } catch (err) {
    next(err);
  }
});

// 4. GET Fee Collection & Aging Ledger
router.get('/ledger', requireRoles('ACCOUNTANT', 'PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await FinanceService.getFeeLedger(req.institutionId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
});

// 2. Reconcile Bank Challan (Accountant)
router.post('/reconcile', requireRoles('ACCOUNTANT', 'INSTITUTION_ADMIN'), auditLogger('CHALLAN_RECONCILED', 'FINANCE'), async (req, res, next) => {
  try {
    const { transactionId, amount, challanRef, method } = req.body;
    const updated = await FinanceService.reconcileChallan(transactionId, { amount, challanRef, method });
    res.json({ success: true, message: 'Challan verified and reconciled with treasury ledger.', transaction: updated });
  } catch (err) {
    next(err);
  }
});

// 3. Pay Student Fee
router.post('/pay', requireRoles('ACCOUNTANT', 'PARENT', 'STUDENT', 'INSTITUTION_ADMIN'), auditLogger('FEE_PAYMENT_PROCESSED', 'FINANCE'), async (req, res, next) => {
  try {
    const { studentId, amount, method, challanRef } = req.body;

    const st = await Student.findOne({
      institutionId: req.institutionId,
      $or: [
        { admissionNumber: studentId },
        { _id: studentId.match(/^[0-9a-fA-F]{24}$/) ? studentId : null }
      ].filter(Boolean)
    });

    if (!st) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Student record not found in MongoDB.' };

    let tx = await FeeTransaction.findOne({
      institutionId: req.institutionId,
      studentAdmissionNumber: st.admissionNumber
    }).sort({ transactionDate: -1 });

    if (!tx) {
      tx = await FeeTransaction.create({
        institutionId: req.institutionId,
        studentAdmissionNumber: st.admissionNumber,
        studentName: st.fullName,
        gradeDivision: `${st.grade}-${st.section}`,
        parentName: st.parentName,
        parentPhone: st.parentWhatsApp,
        invoiceNumber: `INV-2026-${Math.floor(Math.random() * 8000) + 1000}`,
        amountBilled: 45000,
        amountPaid: 0,
        pendingAmount: 45000,
        status: 'OVERDUE'
      });
    }

    const updated = await FinanceService.reconcileChallan(tx._id.toString(), { amount: amount || 20000, challanRef, method });
    res.json({ success: true, message: 'Tuition payment processed successfully in MongoDB.', transaction: updated });
  } catch (err) {
    next(err);
  }
});

// 4. Parameterized Transaction Reconcile (Called by Frontend api.reconcilePayment)
router.post('/transactions/:id/reconcile', requireRoles('ACCOUNTANT', 'INSTITUTION_ADMIN', 'PRINCIPAL'), auditLogger('CHALLAN_RECONCILED', 'FINANCE'), async (req, res, next) => {
  try {
    const txId = req.params.id;
    const tx = await FeeTransaction.findOne({
      institutionId: req.institutionId,
      $or: [
        { _id: txId.match(/^[0-9a-fA-F]{24}$/) ? txId : null },
        { invoiceNumber: txId },
        { challanReference: txId }
      ].filter(Boolean)
    });

    if (!tx) {
      return res.status(404).json({ success: false, error: 'Fee transaction not found in database.' });
    }

    tx.status = 'PAID';
    tx.amountPaid = tx.amountBilled;
    tx.pendingAmount = 0;
    tx.transactionDate = new Date();
    await tx.save();

    // Sync Student feePaymentStatus
    await Student.updateOne(
      { institutionId: req.institutionId, admissionNumber: tx.studentAdmissionNumber },
      { feePaymentStatus: 'PAID' }
    );

    res.json({
      success: true,
      message: `Transaction ${tx.invoiceNumber || tx.challanReference || txId} reconciled and cleared into accounts ledger.`,
      transaction: tx
    });
  } catch (err) {
    next(err);
  }
});

// 5. Record New Fee Receipt (Accountant)
router.post('/receipt', requireRoles('ACCOUNTANT', 'INSTITUTION_ADMIN', 'PRINCIPAL'), auditLogger('FEE_RECEIPT_ISSUED', 'FINANCE'), async (req, res, next) => {
  try {
    const { studentName, grade, amount, method, status } = req.body;
    if (!studentName || !amount) {
      return res.status(400).json({ success: false, error: 'Student name and amount are required.' });
    }

    const numAmount = Number(String(amount).replace(/[^0-9]/g, '')) || 45000;
    const invNum = `INV-2026-${Math.floor(Math.random() * 8000) + 1000}`;
    const txRef = `PAY-2026-${Math.floor(Math.random() * 900) + 100}`;

    const student = await Student.findOne({
      institutionId: req.institutionId,
      $or: [
        { fullName: { $regex: studentName, $options: 'i' } },
        { admissionNumber: studentName }
      ]
    });

    const admissionNumber = student ? student.admissionNumber : `ADM-2026-${Date.now().toString().slice(-3)}`;

    const tx = await FeeTransaction.create({
      institutionId: req.institutionId,
      studentAdmissionNumber: admissionNumber,
      studentName: student ? student.fullName : studentName,
      gradeDivision: grade || (student ? `${student.grade}-${student.section}` : 'Grade 9-A'),
      parentName: student?.parentName || 'Parent Guardian',
      parentPhone: student?.parentWhatsApp || '',
      invoiceNumber: invNum,
      challanReference: txRef,
      amountBilled: numAmount,
      amountPaid: status === 'COMPLETED' || status === 'PAID' ? numAmount : 0,
      pendingAmount: status === 'COMPLETED' || status === 'PAID' ? 0 : numAmount,
      paymentMethod: method || 'ONLINE_GATEWAY',
      status: status === 'COMPLETED' || status === 'PAID' ? 'PAID' : (status || 'PENDING'),
      transactionDate: new Date()
    });

    if (student && (status === 'COMPLETED' || status === 'PAID')) {
      student.feePaymentStatus = 'PAID';
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: 'Fee receipt recorded and committed to institutional ledger.',
      transaction: tx
    });
  } catch (err) {
    next(err);
  }
});

export default router;
