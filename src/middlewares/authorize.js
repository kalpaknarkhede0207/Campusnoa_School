import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Gfm } from '../models/Gfm.js';
import { Faculty } from '../models/Faculty.js';

// 1. Role-Based Access Control
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    }

    if (req.user.roleCode === 'SUPER_ADMIN') {
      return next(); // Super Admin bypasses role check
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Security Access Violation: Role '${req.user.roleCode}' lacks required authority (${allowedRoles.join(', ')}).`
      });
    }

    next();
  };
};

// 2. Attribute-Based Record Ownership Scoping (ABAC)
export const requireRecordScope = (scopeType) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    // Leadership & Admins bypass individual record ownership
    if (['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(user.roleCode)) {
      return next();
    }

    const targetStudentId = req.params.studentId || req.params.id || req.query.studentId || req.body.studentId;

    if (scopeType === 'STUDENT') {
      if (user.roleCode === 'STUDENT') {
        const studentProfile = await Student.findOne({
          $or: [{ userId: user._id }, { email: user.email }]
        });
        if (!studentProfile || (studentProfile._id.toString() !== targetStudentId && studentProfile.admissionNumber !== targetStudentId)) {
          return res.status(403).json({
            success: false,
            error: 'IDOR_VIOLATION',
            message: 'Access Denied: You are only authorized to inspect your own academic records.'
          });
        }
      }
    }

    if (scopeType === 'PARENT') {
      if (user.roleCode === 'PARENT') {
        const parentProfile = await Parent.findOne({
          $or: [{ userId: user._id }, { emergencyContact: user.phone }]
        });
        const linkedAdmissions = parentProfile?.linkedStudentAdmissionNumbers || [];

        // Check if student matches linked admission numbers
        const isLinked = linkedAdmissions.includes(targetStudentId);
        if (!isLinked) {
          // Check by _id if needed
          const st = await Student.findOne({ admissionNumber: targetStudentId });
          if (!st || !linkedAdmissions.includes(st.admissionNumber)) {
            return res.status(403).json({
              success: false,
              error: 'IDOR_VIOLATION',
              message: 'Access Denied: You can only view records for your linked child.'
            });
          }
        }
      }
    }

    if (scopeType === 'GFM') {
      if (user.roleCode === 'GFM' || user.roleCode === 'FACULTY') {
        const facultyProfile = await Faculty.findOne({ userId: user._id });
        const gfm = await Gfm.findOne({
          $or: [
            { facultyId: facultyProfile?._id },
            { employeeCode: facultyProfile?.employeeCode }
          ]
        });

        if (!gfm) {
          return res.status(403).json({
            success: false,
            error: 'NOT_A_GFM',
            message: 'Access Denied: You do not have an active GFM mentorship portfolio.'
          });
        }

        if (targetStudentId) {
          const isAssigned = gfm.menteeAdmissionNumbers.includes(targetStudentId);
          if (!isAssigned) {
            return res.status(403).json({
              success: false,
              error: 'UNASSIGNED_MENTEE',
              message: 'Access Denied: This student is not assigned to your mentorship cohort.'
            });
          }
        }
      }
    }

    next();
  };
};
