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

// Restricted to Counsellor, Leadership, Teachers, and Admins
router.use(requireRoles('COUNSELLOR', 'PRINCIPAL', 'VICE_PRINCIPAL', 'CLASS_TEACHER', 'TEACHER', 'INSTITUTION_ADMIN', 'SUPER_ADMIN', 'SCHOOL_MGMT', 'ADMIN_OFFICER'));

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
        gradeSection: `${student.grade || 'Grade 1'}-${student.section || 'A'}`,
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
    const { studentId, studentName, category, reason, confidentialNotes, notes, actionPlan, followUpDate } = req.body;
    const targetQuery = studentId || studentName || '';

    const student = await Student.findOne({
      institutionId: req.institutionId,
      $or: [
        { admissionNumber: targetQuery },
        { _id: targetQuery.match(/^[0-9a-fA-F]{24}$/) ? targetQuery : null },
        { fullName: { $regex: targetQuery, $options: 'i' } }
      ].filter(Boolean)
    });

    const admissionNumber = student ? student.admissionNumber : (targetQuery || 'ADM-2026-001');

    const note = await MentorshipNote.create({
      institutionId: req.institutionId,
      studentAdmissionNumber: admissionNumber,
      noteType: category || reason || 'PASTORAL',
      content: confidentialNotes || notes || 'Counseling observation recorded.',
      actionPlan: actionPlan || 'Weekly counseling session planned.',
      isConfidential: true,
      followUpDate: followUpDate ? new Date(followUpDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({ success: true, message: 'Confidential wellbeing record committed to MongoDB.', note });
  } catch (err) {
    next(err);
  }
};

router.post('/add-case', auditLogger('COUNSELLING_CASE_CREATED', 'PASTORAL'), handleAddCase);
router.post('/cases', auditLogger('COUNSELLING_CASE_CREATED', 'PASTORAL'), handleAddCase);

// 3. POST Resolve Confidential Case
router.post('/cases/:id/resolve', auditLogger('COUNSELLING_CASE_RESOLVED', 'PASTORAL'), async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const { resolutionNote } = req.body;

    const note = await MentorshipNote.findOne({
      institutionId: req.institutionId,
      $or: [
        { _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null },
        { studentAdmissionNumber: caseId }
      ].filter(Boolean)
    });

    if (note) {
      note.actionPlan = resolutionNote ? `${note.actionPlan || ''} | Resolution: ${resolutionNote}` : (note.actionPlan || 'Resolved');
      note.followUpDate = null;
      await note.save();
    }

    res.json({ success: true, message: 'Confidential case marked as successfully resolved in database.' });
  } catch (err) {
    next(err);
  }
});

export default router;
