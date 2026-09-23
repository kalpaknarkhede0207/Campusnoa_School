import { Faculty } from '../models/Faculty.js';
import { User } from '../models/User.js';
import { LeaveApplication } from '../models/LeaveApplication.js';
import { TimetableProxy } from '../models/TimetableProxy.js';

export class FacultyService {
  static async getAllFaculty(institutionId) {
    const facultyList = await Faculty.find({ institutionId }).populate('userId').lean();

    const teaching = facultyList.filter(f => f.designationTier !== 'ADMIN_STAFF');
    const nonTeaching = facultyList.filter(f => f.designationTier === 'ADMIN_STAFF');

    const formattedTeaching = teaching.map(f => {
      const user = f.userId || {};
      return {
        id: f._id.toString(),
        code: f.employeeCode,
        fullName: user.fullName || f.employeeCode,
        officialEmail: user.email || `${f.employeeCode.toLowerCase()}@campusnoa.edu`,
        phone: user.phone || '+91 98220 00000',
        designationTier: f.designationTier,
        department: f.department || 'General Faculty',
        highestDegree: f.qualification || 'M.Sc, B.Ed',
        isBedCertified: true,
        tetCertificationId: f.tetCertificationId || 'CTET-PAPER-II-98214',
        experienceYears: f.experienceYears || 5,
        assignedClasses: f.assignedClasses || [
          { grade: 'Grade 9', section: 'A', role: 'Subject Teacher' }
        ],
        homeroomAssignment: f.homeroomDivision || 'None',
        maxWeeklyProxies: f.maxWeeklyProxies || 3,
        presenceStatus: f.presenceStatus || 'PRESENT',
        appointmentStatus: 'APPROVED',
        classReport: f.classReport || {
          syllabusCompletionPercent: 84,
          classAverageScore: 85.2,
          attendanceRate: 94.8,
          studentsCount: 10
        }
      };
    });

    const formattedNonTeaching = nonTeaching.map(f => {
      const user = f.userId || {};
      return {
        id: f._id.toString(),
        code: f.employeeCode,
        fullName: user.fullName || f.employeeCode,
        role: f.department || 'Operational Staff',
        department: f.department || 'Administration',
        phone: user.phone || '+91 98220 00000',
        responsibilities: f.qualification || 'Operational oversight & compliance'
      };
    });

    // Fetch leaves
    const leaves = await LeaveApplication.find({ institutionId }).sort({ createdAt: -1 }).lean();

    const formattedLeaves = leaves.map(l => ({
      id: l._id.toString(),
      teacherCode: l.applicantEmployeeCode,
      teacherName: l.applicantName,
      leaveType: l.leaveType,
      dates: `${l.startDate} to ${l.endDate}`,
      reason: l.reason,
      delegatedToCode: l.delegatedEmployeeCode || 'N/A',
      delegatedToName: l.delegatedName || 'Unassigned',
      delegationStatus: l.delegationStatus,
      principalStatus: l.principalStatus
    }));

    return {
      teachers: formattedTeaching,
      nonTeachingStaff: formattedNonTeaching,
      leaves: formattedLeaves
    };
  }

  static async applyLeave(institutionId, data) {
    return LeaveApplication.create({
      institutionId,
      applicantEmployeeCode: data.applicantEmployeeCode || data.teacherCode || 'T-101',
      applicantName: data.applicantName || 'Faculty Member',
      delegatedEmployeeCode: data.delegatedEmployeeCode || data.delegatedToCode || 'N/A',
      delegatedName: data.delegatedName || data.delegatedToName || 'Unassigned',
      leaveType: data.leaveType || 'CASUAL',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      delegationStatus: 'PENDING',
      principalStatus: 'PENDING'
    });
  }

  static async updateLeaveDelegation(leaveId, status) {
    return LeaveApplication.findByIdAndUpdate(
      leaveId,
      { delegationStatus: status },
      { returnDocument: 'after' }
    );
  }

  static async updatePrincipalLeave(leaveId, status) {
    return LeaveApplication.findByIdAndUpdate(
      leaveId,
      { principalStatus: status },
      { returnDocument: 'after' }
    );
  }

  static async assignProxy(institutionId, data) {
    return TimetableProxy.create({
      institutionId,
      assignedEmployeeCode: data.assignedEmployeeCode || data.assignedFacultyCode || 'T-102',
      periodNumber: data.periodNumber || 1,
      timeSlot: data.timeSlot || 'Period 4 (11:15 AM)',
      divisionName: data.divisionName || 'Grade 8-B',
      subjectName: data.subjectName || 'Science',
      absentTeacherName: data.absentTeacherName,
      lessonHandover: data.lessonHandover || 'Supervised self-study worksheet',
      status: 'ASSIGNED'
    });
  }
}
export default FacultyService;
