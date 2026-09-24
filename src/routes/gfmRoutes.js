import express from 'express';
import { GfmService } from '../services/gfmService.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { enforceTenantScope } from '../middlewares/tenantScope.js';
import { requireRoles } from '../middlewares/authorize.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { Faculty } from '../models/Faculty.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantScope);

// 1. GET GFM Mentees Cohort
router.get('/mentees', requireRoles('GFM', 'GFM_COORDINATOR', 'FACULTY', 'CLASS_TEACHER', 'PRINCIPAL'), async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    const targetId = faculty ? faculty.employeeCode : req.user._id.toString();
    const mentees = await GfmService.getMentees(targetId);
    res.json({ success: true, count: mentees.length, mentees });
  } catch (err) {
    next(err);
  }
});

// 2. POST Mentorship / Pastoral Note (Audited)
router.post('/notes', requireRoles('GFM', 'GFM_COORDINATOR', 'FACULTY', 'CLASS_TEACHER', 'COUNSELLOR'), auditLogger('MENTORSHIP_NOTE_RECORDED', 'GFM'), async (req, res, next) => {
  try {
    const { studentAdmissionNumber, studentId, noteType, content, actionPlan, isConfidential, followUpDate } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    const note = await GfmService.addNote(req.institutionId, {
      studentAdmissionNumber: studentAdmissionNumber || studentId,
      employeeCode: faculty?.employeeCode || 'T-101',
      noteType,
      content,
      actionPlan,
      isConfidential,
      followUpDate
    });
    res.status(201).json({ success: true, message: 'Mentorship intervention note recorded in MongoDB.', note });
  } catch (err) {
    next(err);
  }
});

// 2b. GET Mentorship Notes (For Student or Institution)
router.get('/notes', async (req, res, next) => {
  try {
    const { MentorshipNote } = await import('../models/MentorshipNote.js');
    const { studentId } = req.query;
    const query = { institutionId: req.institutionId };
    if (studentId) {
      query.studentAdmissionNumber = studentId;
    }
    const notes = await MentorshipNote.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: notes.length, notes });
  } catch (err) {
    next(err);
  }
});

// 3. GET Institution At-Risk Student Alerts
router.get('/alerts', requireRoles('GFM_COORDINATOR', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HOD'), async (req, res, next) => {
  try {
    const alerts = await GfmService.getAtRiskAlerts(req.institutionId);
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    next(err);
  }
});

export default router;
