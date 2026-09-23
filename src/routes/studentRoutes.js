import express from 'express';
import { StudentService } from '../services/studentService.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { enforceTenantScope } from '../middlewares/tenantScope.js';
import { requireRoles, requireRecordScope } from '../middlewares/authorize.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';

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

// 2. GET Student Profile (ABAC Record Scoping Protected)
router.get('/:id', requireRecordScope('STUDENT'), requireRecordScope('PARENT'), async (req, res, next) => {
  try {
    const student = await StudentService.getStudentById(req.institutionId, req.params.id);
    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
});

// 3. POST Admit Student (Admissions Officer & Admin)
router.post('/admit', requireRoles('ADMIN_OFFICER', 'ADMISSIONS', 'INSTITUTION_ADMIN'), auditLogger('STUDENT_ADMITTED', 'STUDENT'), async (req, res, next) => {
  try {
    const data = req.body;
    const admissionNumber = data.admissionNumber || `ADM-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const studentEmail = data.studentEmail || `student.${Date.now()}@campusnoa.edu`;

    // Create student user + profile
    const defaultPassword = await import('bcryptjs').then(b => b.default.hash('CampusNoa@2026!', 12));

    const user = await User.create({
      institutionId: req.institutionId,
      email: studentEmail.toLowerCase().trim(),
      fullName: data.fullName,
      passwordHash: defaultPassword,
      roleCode: 'STUDENT',
      phone: data.parentWhatsApp,
      auth0Sub: `auth0|${studentEmail.replace(/[@.]/g, '_')}`
    });

    const student = await Student.create({
      institutionId: req.institutionId,
      userId: user._id,
      admissionNumber,
      fullName: data.fullName,
      email: user.email,
      grade: data.grade || 'Grade 9',
      section: data.section || 'A',
      rollNo: data.rollNo || 25,
      dob: data.dob || '2012-05-15',
      gender: data.gender || 'Male',
      bloodGroup: data.bloodGroup || 'B+',
      parentName: data.parentName || 'Parent Guardian',
      parentWhatsApp: data.parentWhatsApp || '+91 98220 11223',
      parentEmail: data.parentEmail || user.email,
      address: data.address || 'Residency Towers, Pune',
      busRoute: data.busRoute || 'Self Walker',
      admissionStatus: 'PENDING_APPROVAL',
      riskLevel: 'LOW'
    });

    res.status(201).json({
      success: true,
      message: 'Student application submitted and sent to Principal approval queue.',
      student
    });
  } catch (err) {
    next(err);
  }
});

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

    res.json({ success: true, message: `Student admission ${status.toLowerCase()} successfully.` });
  } catch (err) {
    next(err);
  }
});

export default router;
