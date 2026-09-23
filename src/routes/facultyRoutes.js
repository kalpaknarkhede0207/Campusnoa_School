import express from 'express';
import { FacultyService } from '../services/facultyService.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { enforceTenantScope } from '../middlewares/tenantScope.js';
import { requireRoles } from '../middlewares/authorize.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { Faculty } from '../models/Faculty.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantScope);

// 1. GET Faculty Directory, Staff, Leaves, Announcements
router.get('/', async (req, res, next) => {
  try {
    const data = await FacultyService.getAllFaculty(req.institutionId);

    // Fetch announcements
    const announcements = await Notification.find({
      institutionId: req.institutionId,
      type: 'ANNOUNCEMENT'
    }).sort({ createdAt: -1 }).limit(10).lean();

    const faculty = [
      ...(data.teachers || []).map(t => ({
        id: t.id,
        _id: t.id,
        name: t.fullName,
        fullName: t.fullName,
        email: t.officialEmail,
        phone: t.phone,
        type: 'teaching',
        designation: t.designationTier,
        department: t.department,
        subject: t.department,
        qualification: t.highestDegree,
        experience: `${t.experienceYears} Years`,
        employeeId: t.code,
        joiningDate: t.joiningDate || t.createdAt
      })),
      ...(data.nonTeachingStaff || []).map(s => ({
        id: s.id,
        _id: s.id,
        name: s.fullName,
        fullName: s.fullName,
        email: s.officialEmail || `${s.code.toLowerCase()}@campusnoa.edu`,
        phone: s.phone,
        type: 'non_teaching',
        designation: s.role,
        department: s.department,
        subject: s.department,
        qualification: s.responsibilities,
        experience: '5+ Years',
        employeeId: s.code,
        joiningDate: s.joiningDate || s.createdAt
      }))
    ];

    res.json({
      success: true,
      faculty,
      ...data,
      announcements: announcements.map(a => ({
        id: a._id.toString(),
        title: a.title,
        message: a.message,
        timestamp: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString()
      }))
    });
  } catch (err) {
    next(err);
  }
});

// 2. Appoint Faculty (HR / Admin / Principal)
const appointFacultyHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const defaultPassword = await import('bcryptjs').then(b => b.default.hash('CampusNoa@2026!', 12));
    const fullName = data.fullName || data.name || 'New Faculty';
    const officialEmail = (data.officialEmail || data.email || `faculty.${Date.now()}@campusnoa.edu`).toLowerCase().trim();
    const designation = data.designationTier || data.designation || 'TGT';
    const isStaff = data.type === 'non_teaching' || designation.toUpperCase().includes('STAFF');

    let user = await User.findOne({ email: officialEmail });
    if (!user) {
      user = await User.create({
        institutionId: req.institutionId,
        email: officialEmail,
        fullName,
        passwordHash: defaultPassword,
        roleCode: isStaff ? 'STAFF' : 'TEACHER',
        phone: data.phone || '+91 98220 00000',
        auth0Sub: `auth0|${officialEmail.replace(/[@.]/g, '_')}`
      });
    }

    const count = await Faculty.countDocuments({ institutionId: req.institutionId });
    const employeeCode = data.code || data.employeeCode || `EMP-${Date.now().toString().slice(-4)}${count + 1}`;

    const faculty = await Faculty.create({
      institutionId: req.institutionId,
      userId: user._id,
      employeeCode,
      designationTier: isStaff ? 'ADMIN_STAFF' : designation,
      department: data.department || data.subject || 'Academics',
      qualification: data.highestDegree || data.qualification || 'M.Sc, B.Ed',
      experienceYears: Number(data.experienceYears) || 5,
      tetCertificationId: data.tetCertificationId || 'CTET-PAPER-II-98214',
      homeroomDivision: data.homeroomAssignment || 'None',
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date()
    });

    res.status(201).json({ success: true, message: 'Faculty appointed and synchronized to database successfully.', faculty });
  } catch (err) {
    console.error('Faculty appointment error:', err);
    res.status(400).json({ success: false, error: err.message || 'Faculty appointment failed.' });
  }
};

router.post('/appoint', requireRoles('ADMIN_OFFICER', 'HR', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'SCHOOL_MGMT'), auditLogger('FACULTY_APPOINTED', 'FACULTY'), appointFacultyHandler);
router.post('/', requireRoles('ADMIN_OFFICER', 'HR', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'SCHOOL_MGMT'), auditLogger('FACULTY_APPOINTED', 'FACULTY'), appointFacultyHandler);

// 3. Apply Leave with Workload Delegation
router.post('/apply-leave-delegation', requireRoles('TEACHER', 'CLASS_TEACHER', 'HOD', 'FACULTY'), auditLogger('LEAVE_APPLIED', 'FACULTY'), async (req, res, next) => {
  try {
    const data = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    const leave = await FacultyService.applyLeave(req.institutionId, {
      applicantEmployeeCode: faculty?.employeeCode || 'T-101',
      applicantName: req.user.fullName,
      delegatedEmployeeCode: data.delegatedToCode || data.delegatedEmployeeCode || 'N/A',
      delegatedName: data.delegatedToName || data.delegatedName || 'Unassigned',
      leaveType: data.leaveType || 'CASUAL',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason
    });

    res.status(201).json({ success: true, message: 'Leave application submitted with peer delegation notice.', leave });
  } catch (err) {
    next(err);
  }
});

// 4. Respond to Leave Delegation (Peer Teacher)
router.post('/respond-delegation', requireRoles('TEACHER', 'CLASS_TEACHER', 'HOD', 'FACULTY'), async (req, res, next) => {
  try {
    const { leaveId, action } = req.body;
    const status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    await FacultyService.updateLeaveDelegation(leaveId, status);
    res.json({ success: true, message: `Delegation response (${status}) recorded.` });
  } catch (err) {
    next(err);
  }
});

// 5. Principal Leave Action
router.post('/leave-action', requireRoles('PRINCIPAL', 'VICE_PRINCIPAL', 'INSTITUTION_ADMIN'), auditLogger('LEAVE_APPROVED', 'FACULTY'), async (req, res, next) => {
  try {
    const { leaveId, action } = req.body;
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await FacultyService.updatePrincipalLeave(leaveId, status);
    res.json({ success: true, message: `Leave application ${status.toLowerCase()} by leadership.` });
  } catch (err) {
    next(err);
  }
});

// 6. Vice Principal Timetable Proxy Assignment
router.post('/proxy-assign', requireRoles('VICE_PRINCIPAL', 'PRINCIPAL', 'INSTITUTION_ADMIN'), auditLogger('PROXY_ASSIGNED', 'FACULTY'), async (req, res, next) => {
  try {
    const proxy = await FacultyService.assignProxy(req.institutionId, req.body);
    res.status(201).json({ success: true, message: 'Timetable proxy substitution recorded and faculty notified.', proxy });
  } catch (err) {
    next(err);
  }
});

export default router;
