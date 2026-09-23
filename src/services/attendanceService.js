import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';

export class AttendanceService {
  static async saveBatchAttendance(institutionId, divisionName, recordedByEmployeeCode, date, periodNumber, records) {
    const results = [];

    for (const r of records) {
      // Find internal student
      const student = await Student.findOne({
        institutionId,
        $or: [
          { admissionNumber: r.studentId },
          { _id: r.studentId.match(/^[0-9a-fA-F]{24}$/) ? r.studentId : null }
        ].filter(Boolean)
      });

      if (!student) continue;

      const targetDivision = divisionName || `${student.grade}-${student.section}`;

      const record = await Attendance.findOneAndUpdate(
        {
          divisionName: targetDivision,
          studentAdmissionNumber: student.admissionNumber,
          date,
          periodNumber: periodNumber || 1
        },
        {
          institutionId,
          divisionName: targetDivision,
          studentAdmissionNumber: student.admissionNumber,
          recordedByEmployeeCode: recordedByEmployeeCode || 'FAC-101',
          date,
          periodNumber: periodNumber || 1,
          status: r.status,
          remarks: r.remarks || null
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      results.push(record);

      // Re-evaluate student term risk level
      const totalAtt = await Attendance.countDocuments({ studentAdmissionNumber: student.admissionNumber });
      const presentCount = await Attendance.countDocuments({
        studentAdmissionNumber: student.admissionNumber,
        status: 'PRESENT'
      });

      if (totalAtt >= 3) {
        const pct = (presentCount / totalAtt) * 100;
        const newRisk = pct < 75 ? 'HIGH' : (pct < 80 ? 'MODERATE' : 'LOW');
        await Student.updateOne(
          { admissionNumber: student.admissionNumber },
          { riskLevel: newRisk }
        );
      }
    }

    return { success: true, count: results.length };
  }

  static async getDivisionAttendance(divisionName, date) {
    return Attendance.find({ divisionName, date }).lean();
  }
}
export default AttendanceService;
