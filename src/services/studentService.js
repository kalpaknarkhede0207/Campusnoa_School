import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { FeeTransaction } from '../models/FeeTransaction.js';
import { MentorshipNote } from '../models/MentorshipNote.js';

export class StudentService {
  static async getAllStudents(institutionId, filters = {}) {
    const query = { institutionId };

    if (filters.search) {
      query.$or = [
        { admissionNumber: { $regex: filters.search, $options: 'i' } },
        { fullName: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.grade) query.grade = filters.grade;
    if (filters.section) query.section = filters.section;
    if (filters.riskLevel) query.riskLevel = filters.riskLevel;
    if (filters.busRoute) query.busRoute = filters.busRoute;

    const students = await Student.find(query).sort({ rollNo: 1 }).lean();

    // Fetch batch auxiliary data for high performance
    const admissionNumbers = students.map(s => s.admissionNumber);

    const [allAttendance, allFees] = await Promise.all([
      Attendance.find({
        institutionId,
        studentAdmissionNumber: { $in: admissionNumbers }
      }).sort({ date: -1 }).lean(),
      FeeTransaction.find({
        institutionId,
        studentAdmissionNumber: { $in: admissionNumbers }
      }).sort({ transactionDate: -1 }).lean()
    ]);

    // Map attendance and fees by studentAdmissionNumber
    const attMap = new Map();
    for (const att of allAttendance) {
      if (!attMap.has(att.studentAdmissionNumber)) {
        attMap.set(att.studentAdmissionNumber, []);
      }
      attMap.get(att.studentAdmissionNumber).push(att);
    }

    const feeMap = new Map();
    for (const fee of allFees) {
      if (!feeMap.has(fee.studentAdmissionNumber)) {
        feeMap.set(fee.studentAdmissionNumber, fee);
      }
    }

    // Format into comprehensive view objects
    return students.map(s => {
      const studentAtt = attMap.get(s.admissionNumber) || [];
      const totalAtt = studentAtt.length;
      const presentCount = studentAtt.filter(a => a.status === 'PRESENT').length;
      const termAttendancePercent = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 1000) / 10 : 0;

      const latestFee = feeMap.get(s.admissionNumber);
      const feeStatus = latestFee ? latestFee.status : (s.feePaymentStatus || 'PENDING');
      const paidAmount = latestFee ? latestFee.amountPaid : 0;
      const totalAmount = latestFee ? latestFee.amountBilled : 45000;

      return {
        id: s.admissionNumber,
        dbId: s._id.toString(),
        admissionNumber: s.admissionNumber,
        rollNo: `STU-${String(s.rollNo || 1).padStart(3, '0')}`,
        rollNumber: s.rollNo,
        name: s.fullName,
        fullName: s.fullName,
        email: s.email,
        dob: s.dob || '2012-05-15',
        gender: s.gender || 'Male',
        bloodGroup: s.bloodGroup || 'B+',
        grade: s.grade || 'Grade 9',
        section: s.section || 'A',
        academicYear: '2026-2027',
        admissionDate: s.admissionDate || s.createdAt,
        classTeacher: s.classTeacher || 'Not Assigned',
        gfmMentor: s.gfmMentor || 'Not Assigned',
        parentName: s.parentName || 'Parent Guardian',
        parentWhatsApp: s.parentWhatsApp || '',
        parentEmail: s.parentEmail || s.email,
        address: s.address || '',
        allergies: s.allergies || 'None reported',
        commuteMode: s.busRoute && s.busRoute.includes('Route') ? 'School Bus' : 'Private Transport',
        busRoute: s.busRoute || 'Self Walker',
        busStop: 'Stop 1 - Main Chowk',
        currentRiskLevel: s.riskLevel || 'LOW',
        termAttendancePercent,
        attendanceRate: termAttendancePercent,
        totalAttendanceSessions: totalAtt,
        attendanceToday: studentAtt[0]?.status || 'NOT_MARKED',
        marks: {
          aggregatePercentage: 0
        },
        fees: {
          totalAmount,
          paidAmount,
          pendingAmount: totalAmount - paidAmount,
          status: feeStatus,
          lastReceiptDate: latestFee?.transactionDate || null
        },
        feeStatus,
        admissionStatus: s.admissionStatus || 'APPROVED'
      };
    });
  }

  static async getStudentById(institutionId, idOrAdmissionNumber) {
    const student = await Student.findOne({
      institutionId,
      $or: [
        { _id: idOrAdmissionNumber.match(/^[0-9a-fA-F]{24}$/) ? idOrAdmissionNumber : null },
        { admissionNumber: idOrAdmissionNumber }
      ].filter(Boolean)
    }).lean();

    if (!student) {
      throw { statusCode: 404, code: 'STUDENT_NOT_FOUND', message: 'Student profile not found in MongoDB.' };
    }

    const [attendance, feeTransactions, mentorshipNotes] = await Promise.all([
      Attendance.find({ institutionId, studentAdmissionNumber: student.admissionNumber }).sort({ date: -1 }).lean(),
      FeeTransaction.find({ institutionId, studentAdmissionNumber: student.admissionNumber }).sort({ transactionDate: -1 }).lean(),
      MentorshipNote.find({ institutionId, studentAdmissionNumber: student.admissionNumber }).sort({ createdAt: -1 }).lean()
    ]);

    return {
      ...student,
      id: student.admissionNumber,
      dbId: student._id.toString(),
      attendance,
      feeTransactions,
      mentorshipNotes
    };
  }
}
export default StudentService;
