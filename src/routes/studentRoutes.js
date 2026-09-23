import express from 'express';
import { StudentService } from '../services/studentService.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { enforceTenantScope } from '../middlewares/tenantScope.js';
import { requireRoles, requireRecordScope } from '../middlewares/authorize.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { FeeTransaction } from '../models/FeeTransaction.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantScope);

// 1. GET Students (Filtered & Scoped)
router.get('/', async (req, res, next) => {
  try {
    const students = await StudentService.getAllStudents(req.institutionId, req.query);
    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (err) {
    next(err);
  }
});

// 1b. GET Authenticated Parent's Linked Ward
router.get('/ward', async (req, res, next) => {
  try {
    const { Parent } = await import('../models/Parent.js');
    const userEmail = req.user.email?.toLowerCase().trim();
    const userPhone = req.user.phone;

    const parentProfile = await Parent.findOne({
      institutionId: req.institutionId,
      $or: [
        { userId: req.user._id },
        { emergencyContact: userPhone }
      ].filter(Boolean)
    });

    let student = null;
    if (parentProfile && parentProfile.linkedStudentAdmissionNumbers?.length > 0) {
      student = await Student.findOne({
        institutionId: req.institutionId,
        admissionNumber: { $in: parentProfile.linkedStudentAdmissionNumbers }
      });
    }

    if (!student) {
      student = await Student.findOne({
        institutionId: req.institutionId,
        $or: [
          { parentEmail: userEmail },
          { parentWhatsApp: userPhone },
          { parentName: req.user.fullName }
        ].filter(Boolean)
      });
    }

    if (!student) {
      student = await Student.findOne({ institutionId: req.institutionId });
    }

    if (!student) {
      return res.json({ success: true, student: null });
    }

    const fullProfile = await StudentService.getStudentById(req.institutionId, student.admissionNumber);
    res.json({ success: true, student: fullProfile });
  } catch (err) {
    next(err);
  }
});

// 2. GET Student Profile (ABAC Record Scoping Protected)
router.get('/:id', requireRecordScope('STUDENT'), requireRecordScope('PARENT'), async (req, res, next) => {
  try {
    const student = await StudentService.getStudentById(req.institutionId, req.params.id);
    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
});

// 2b. PUT Update Student Profile (Admin / Admissions / Principal)
router.put('/:id', requireRoles('ADMIN_OFFICER', 'ADMISSIONS', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'), auditLogger('STUDENT_UPDATED', 'STUDENT'), async (req, res, next) => {
  try {
    const student = await Student.findOneAndUpdate(
      {
        institutionId: req.institutionId,
        $or: [
          { admissionNumber: req.params.id },
          { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }
        ].filter(Boolean)
      },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    NotificationService.broadcastInstitutionEvent(req.institutionId, 'STUDENT_UPDATED', student);
    res.json({ success: true, message: 'Student record updated successfully.', student });
  } catch (err) {
    next(err);
  }
});

// 2c. DELETE Student Profile (Admissions / Admin / Principal / VP / Class Teacher)
router.delete('/:id', requireRoles('ADMIN_OFFICER', 'ADMISSIONS', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'VICE_PRINCIPAL', 'CLASS_TEACHER'), auditLogger('STUDENT_DELETED', 'STUDENT'), async (req, res, next) => {
  try {
    const student = await Student.findOneAndDelete({
      institutionId: req.institutionId,
      $or: [
        { admissionNumber: req.params.id },
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }
      ].filter(Boolean)
    });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // Clean up auxiliary collections for this student
    await Promise.all([
      Attendance.deleteMany({ institutionId: req.institutionId, studentAdmissionNumber: student.admissionNumber }),
      FeeTransaction.deleteMany({ institutionId: req.institutionId, studentAdmissionNumber: student.admissionNumber })
    ]);

    NotificationService.broadcastInstitutionEvent(req.institutionId, 'STUDENT_DELETED', {
      id: student._id,
      admissionNumber: student.admissionNumber,
      fullName: student.fullName
    });

    res.json({
      success: true,
      message: `Student ${student.fullName} (${student.admissionNumber}) removed successfully from institutional records.`,
      student
    });
  } catch (err) {
    next(err);
  }
});

// 3. POST Admit Student (Admissions Officer & Admin & Principal)
const admitStudentHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const admissionNumber = data.admissionNumber || `ADM-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const studentEmail = (data.studentEmail || data.email || `student.${Date.now()}@campusnoa.edu`).toLowerCase().trim();
    const fullName = data.fullName || data.name || 'New Student';

    // Create student user + profile safely
    const defaultPassword = await import('bcryptjs').then(b => b.default.hash('CampusNoa@2026!', 12));

    let user = await User.findOne({ email: studentEmail });
    if (!user) {
      user = await User.create({
        institutionId: req.institutionId,
        email: studentEmail,
        fullName,
        passwordHash: defaultPassword,
        roleCode: 'STUDENT',
        phone: data.parentWhatsApp || data.phone || '+91 98220 11223',
        auth0Sub: `auth0|${studentEmail.replace(/[@.]/g, '_')}`
      });
    }

    const student = await Student.create({
      institutionId: req.institutionId,
      userId: user._id,
      admissionNumber,
      fullName,
      email: user.email,
      grade: data.grade || data.class || 'Grade 9',
      section: data.section || 'A',
      rollNo: Number(data.rollNo) || (await Student.countDocuments({ institutionId: req.institutionId })) + 1,
      dob: data.dob || '2012-05-15',
      gender: data.gender || 'Male',
      bloodGroup: data.bloodGroup || 'B+',
      parentName: data.parentName || data.guardianName || 'Parent Guardian',
      parentWhatsApp: data.parentWhatsApp || data.phone || '',
      parentEmail: data.parentEmail || user.email,
      address: data.address || '',
      busRoute: data.busRoute || 'Self Walker',
      admissionStatus: data.admissionStatus || 'APPROVED',
      riskLevel: data.riskLevel || 'LOW',
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
      classTeacher: data.classTeacher || 'Not Assigned',
      gfmMentor: data.gfmMentor || 'Not Assigned',
      overallAttendancePercentage: 0,
      feePaymentStatus: data.feePaymentStatus || 'PENDING'
    });

    // Create institutional fee invoice transaction
    try {
      const isPaid = student.feePaymentStatus === 'PAID';
      await FeeTransaction.create({
        institutionId: req.institutionId,
        studentAdmissionNumber: student.admissionNumber,
        studentName: student.fullName,
        gradeDivision: `${student.grade}-${student.section}`,
        parentName: student.parentName,
        parentPhone: student.parentWhatsApp,
        invoiceNumber: `INV-2026-${student.admissionNumber.replace(/[^0-9]/g, '') || Math.floor(Math.random() * 8000 + 1000)}`,
        challanReference: `REF-${student.admissionNumber}`,
        amountBilled: 45000,
        amountPaid: isPaid ? 45000 : 0,
        pendingAmount: isPaid ? 0 : 45000,
        paymentMethod: isPaid ? 'Online Gateway' : 'Bank Challan',
        status: isPaid ? 'PAID' : (student.feePaymentStatus || 'OVERDUE'),
        transactionDate: student.admissionDate || new Date()
      });
    } catch (txErr) {
      console.warn('Initial fee transaction creation warning:', txErr);
    }

    NotificationService.broadcastInstitutionEvent(req.institutionId, 'STUDENT_ADMITTED', student);

    res.status(201).json({
      success: true,
      message: 'Student admitted and synchronized to database successfully.',
      student
    });
  } catch (err) {
    console.error('Admit student error:', err);
    res.status(400).json({ success: false, error: err.message || 'Student admission failed.' });
  }
};

router.post('/admit', requireRoles('ADMIN_OFFICER', 'ADMISSIONS', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'SCHOOL_MGMT'), auditLogger('STUDENT_ADMITTED', 'STUDENT'), admitStudentHandler);
router.post('/', requireRoles('ADMIN_OFFICER', 'ADMISSIONS', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'SCHOOL_MGMT'), auditLogger('STUDENT_ADMITTED', 'STUDENT'), admitStudentHandler);

// 4. Principal Approval of Student Admission
router.post('/principal-approval', requireRoles('PRINCIPAL', 'INSTITUTION_ADMIN'), auditLogger('STUDENT_APPROVED', 'STUDENT'), async (req, res, next) => {
  try {
    const { studentId, action } = req.body;
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await Student.updateMany(
      {
        institutionId: req.institutionId,
        $or: [
          { admissionNumber: studentId },
          { _id: studentId.match(/^[0-9a-fA-F]{24}$/) ? studentId : null }
        ].filter(Boolean)
      },
      { admissionStatus: status }
    );

    NotificationService.broadcastInstitutionEvent(req.institutionId, 'STUDENT_UPDATED', { studentId, status });

    res.json({ success: true, message: `Student admission ${status.toLowerCase()} successfully.` });
  } catch (err) {
    next(err);
  }
});

export default router;
