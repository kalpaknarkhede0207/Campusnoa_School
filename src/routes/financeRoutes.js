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
    const data = await FinanceService.getFeeLedger(req.institutionId);
    res.json({
      success: true,
      transactions: data.transactions,
      summary: data.summary,
      defaulters: data.defaulters
    });
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
router.post('/transactions/:id/reconcile', requireRoles('ACCOUNTANT', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'SCHOOL_MGMT'), auditLogger('CHALLAN_RECONCILED', 'FINANCE'), async (req, res, next) => {
  try {
    const txId = req.params.id;
    let tx = await FeeTransaction.findOne({
      institutionId: req.institutionId,
      $or: [
        { _id: txId.match(/^[0-9a-fA-F]{24}$/) ? txId : null },
        { invoiceNumber: txId },
        { challanReference: txId },
        { studentAdmissionNumber: txId }
      ].filter(Boolean)
    });

    if (!tx) {
      // If student exists, create paid transaction
      const st = await Student.findOne({
        institutionId: req.institutionId,
        $or: [
          { admissionNumber: txId },
          { _id: txId.match(/^[0-9a-fA-F]{24}$/) ? txId : null }
        ].filter(Boolean)
      });
      if (st) {
        tx = await FeeTransaction.create({
          institutionId: req.institutionId,
          studentAdmissionNumber: st.admissionNumber,
          studentName: st.fullName,
          gradeDivision: `${st.grade}-${st.section}`,
          parentName: st.parentName,
          parentPhone: st.parentWhatsApp,
          invoiceNumber: `INV-2026-${st.admissionNumber}`,
          challanReference: `REF-${st.admissionNumber}`,
          amountBilled: 45000,
          amountPaid: 45000,
          pendingAmount: 0,
          paymentMethod: 'Bank Challan Reconciled',
          status: 'PAID',
          transactionDate: new Date()
        });
        st.feePaymentStatus = 'PAID';
        await st.save();
        return res.json({ success: true, message: `Fee reconciled for student ${st.fullName}.`, transaction: tx });
      }
      return res.status(404).json({ success: false, error: 'Fee transaction not found in database.' });
    }

    tx.status = 'PAID';
    tx.amountPaid = tx.amountBilled || 45000;
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
router.post('/receipt', requireRoles('ACCOUNTANT', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'SCHOOL_MGMT'), auditLogger('FEE_RECEIPT_ISSUED', 'FINANCE'), async (req, res, next) => {
  try {
    const { studentName, studentAdmissionNumber, grade, amount, method, status } = req.body;
    if (!studentName && !studentAdmissionNumber) {
      return res.status(400).json({ success: false, error: 'Student identification and amount are required.' });
    }

    const numAmount = Number(String(amount).replace(/[^0-9]/g, '')) || 45000;
    const isCompleted = status === 'COMPLETED' || status === 'PAID';

    let student = null;
    if (studentAdmissionNumber) {
      student = await Student.findOne({ institutionId: req.institutionId, admissionNumber: studentAdmissionNumber });
    }
    if (!student && studentName) {
      student = await Student.findOne({
        institutionId: req.institutionId,
        $or: [
          { fullName: { $regex: studentName, $options: 'i' } },
          { admissionNumber: studentName }
        ]
      });
    }

    const admissionNumber = student ? student.admissionNumber : (studentAdmissionNumber || `ADM-2026-${Date.now().toString().slice(-3)}`);
    const finalStudentName = student ? student.fullName : studentName;
    const finalGrade = student ? `${student.grade}-${student.section}` : (grade || 'Grade 9-A');

    // Check if an existing transaction exists for this student
    let tx = await FeeTransaction.findOne({
      institutionId: req.institutionId,
      studentAdmissionNumber: admissionNumber
    });

    if (tx) {
      tx.amountPaid = isCompleted ? numAmount : tx.amountPaid;
      tx.pendingAmount = isCompleted ? Math.max(0, (tx.amountBilled || numAmount) - numAmount) : tx.pendingAmount;
      tx.status = isCompleted ? 'PAID' : (status || tx.status);
      tx.paymentMethod = method || tx.paymentMethod;
      tx.transactionDate = new Date();
      await tx.save();
    } else {
      const invNum = `INV-2026-${admissionNumber.replace(/[^0-9]/g, '') || Math.floor(Math.random() * 8000 + 1000)}`;
      const txRef = `PAY-2026-${Math.floor(Math.random() * 900) + 100}`;
      tx = await FeeTransaction.create({
        institutionId: req.institutionId,
        studentAdmissionNumber: admissionNumber,
        studentName: finalStudentName,
        gradeDivision: finalGrade,
        parentName: student?.parentName || 'Parent Guardian',
        parentPhone: student?.parentWhatsApp || '',
        invoiceNumber: invNum,
        challanReference: txRef,
        amountBilled: numAmount,
        amountPaid: isCompleted ? numAmount : 0,
        pendingAmount: isCompleted ? 0 : numAmount,
        paymentMethod: method || 'ONLINE_GATEWAY',
        status: isCompleted ? 'PAID' : (status || 'PENDING'),
        transactionDate: new Date()
      });
    }

    if (student && isCompleted) {
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
