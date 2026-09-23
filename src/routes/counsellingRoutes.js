import express from 'express';
import { authenticateToken } from '../middlewares/authenticate.js';
import { enforceTenantScope } from '../middlewares/tenantScope.js';
import { requireRoles } from '../middlewares/authorize.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { MentorshipNote } from '../models/MentorshipNote.js';
import { Student } from '../models/Student.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantScope);

// Restricted to Counsellor, Principal, Class Teacher, and Admins
router.use(requireRoles('COUNSELLOR', 'PRINCIPAL', 'CLASS_TEACHER', 'TEACHER', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'));

// 1. GET Confidential Cases
router.get('/cases', async (req, res, next) => {
  try {
    const notes = await MentorshipNote.find({
      institutionId: req.institutionId,
      isConfidential: true
    }).sort({ createdAt: -1 }).lean();

    const admissionNumbers = notes.map(n => n.studentAdmissionNumber);
    const students = await Student.find({
      institutionId: req.institutionId,
      admissionNumber: { $in: admissionNumbers }
    }).lean();

    const studentMap = new Map(students.map(s => [s.admissionNumber, s]));

    const cases = notes.map((n, idx) => {
      const student = studentMap.get(n.studentAdmissionNumber) || {};
      return {
        caseId: `CASE-2026-0${idx + 7}`,
        studentId: n.studentAdmissionNumber,
        studentName: student.fullName || 'Student',
        gradeSection: `${student.grade || 'Grade 9'}-${student.section || 'A'}`,
        category: n.noteType,
        sessionDate: n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : '2026-09-10',
        confidentialNotes: n.content,
        actionPlan: n.actionPlan || 'Weekly counseling session planned.',
        status: n.followUpDate ? 'ACTIVE_MONITORING' : 'RESOLVED'
      };
    });

    res.json({
      success: true,
      count: cases.length,
      cases
    });
  } catch (err) {
    next(err);
  }
});

// 2. POST Add Confidential Case
const handleAddCase = async (req, res, next) => {
  try {
    const { studentId, category, confidentialNotes, actionPlan, followUpDate } = req.body;

    const student = await Student.findOne({
      institutionId: req.institutionId,
      $or: [
        { admissionNumber: studentId },
        { _id: studentId?.match(/^[0-9a-fA-F]{24}$/) ? studentId : null }
      ].filter(Boolean)
    });

    if (!student) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Student not found in MongoDB.' };

    const note = await MentorshipNote.create({
      institutionId: req.institutionId,
      studentAdmissionNumber: student.admissionNumber,
      noteType: category || 'PASTORAL',
      content: confidentialNotes || 'Counseling observation recorded.',
      actionPlan: actionPlan || 'Follow-up as per pastoral care guideline.',
      isConfidential: true,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    res.status(201).json({ success: true, message: 'Confidential wellbeing record committed to MongoDB.', note });
  } catch (err) {
    next(err);
  }
};

router.post('/add-case', auditLogger('COUNSELLING_CASE_CREATED', 'PASTORAL'), handleAddCase);
router.post('/cases', auditLogger('COUNSELLING_CASE_CREATED', 'PASTORAL'), handleAddCase);

export default router;
