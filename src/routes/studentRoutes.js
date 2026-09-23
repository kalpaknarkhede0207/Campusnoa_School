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

// 3. POST Admit Student (Admissions Officer & Admin & Principal)
const admitStudentHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const admissionNumber = data.admissionNumber || `ADM-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const studentEmail = data.studentEmail || data.email || `student.${Date.now()}@campusnoa.edu`;
    const fullName = data.fullName || data.name || 'New Student';

    // Create student user + profile
    const defaultPassword = await import('bcryptjs').then(b => b.default.hash('CampusNoa@2026!', 12));

    const user = await User.create({
      institutionId: req.institutionId,
      email: studentEmail.toLowerCase().trim(),
      fullName,
      passwordHash: defaultPassword,
      roleCode: 'STUDENT',
      phone: data.parentWhatsApp || data.phone || '+91 98220 11223',
      auth0Sub: `auth0|${studentEmail.replace(/[@.]/g, '_')}`
    });

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
      parentWhatsApp: data.parentWhatsApp || data.phone || '+91 98220 11223',
      parentEmail: data.parentEmail || user.email,
      address: data.address || 'Pune, Maharashtra',
      busRoute: data.busRoute || 'Self Walker',
      admissionStatus: data.admissionStatus || 'APPROVED',
      riskLevel: data.riskLevel || 'LOW'
    });

    res.status(201).json({
      success: true,
      message: 'Student admitted and synchronized to database successfully.',
      student
    });
  } catch (err) {
    next(err);
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

    res.json({ success: true, message: `Student admission ${status.toLowerCase()} successfully.` });
  } catch (err) {
    next(err);
  }
});

export default router;
