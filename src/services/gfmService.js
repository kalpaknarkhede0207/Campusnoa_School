import { Gfm } from '../models/Gfm.js';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Attendance } from '../models/Attendance.js';
import { MentorshipNote } from '../models/MentorshipNote.js';

export class GfmService {
  static async getMentees(facultyIdOrEmployeeCode) {
    let gfm = null;

    // Search by employeeCode or facultyId
    if (typeof facultyIdOrEmployeeCode === 'string' && facultyIdOrEmployeeCode.startsWith('T-')) {
      gfm = await Gfm.findOne({ employeeCode: facultyIdOrEmployeeCode }).lean();
    } else {
      gfm = await Gfm.findOne({
        $or: [
          { facultyId: facultyIdOrEmployeeCode },
          { employeeCode: facultyIdOrEmployeeCode }
        ]
      }).lean();
    }

    // Fallback: If not found, look up faculty by user or id
    if (!gfm) {
      const fac = await Faculty.findOne({
        $or: [
          { _id: facultyIdOrEmployeeCode.match(/^[0-9a-fA-F]{24}$/) ? facultyIdOrEmployeeCode : null },
          { employeeCode: facultyIdOrEmployeeCode },
          { userId: facultyIdOrEmployeeCode.match(/^[0-9a-fA-F]{24}$/) ? facultyIdOrEmployeeCode : null }
        ].filter(Boolean)
      }).lean();

      if (fac) {
        gfm = await Gfm.findOne({ employeeCode: fac.employeeCode }).lean();
      }
    }

    if (!gfm || !gfm.menteeAdmissionNumbers || gfm.menteeAdmissionNumbers.length === 0) {
      return [];
    }

    const students = await Student.find({
      admissionNumber: { $in: gfm.menteeAdmissionNumbers }
    }).lean();

    const [allAtt, allNotes] = await Promise.all([
      Attendance.find({ studentAdmissionNumber: { $in: gfm.menteeAdmissionNumbers } }).lean(),
      MentorshipNote.find({ studentAdmissionNumber: { $in: gfm.menteeAdmissionNumbers } }).sort({ createdAt: -1 }).lean()
    ]);

    const attMap = new Map();
    for (const a of allAtt) {
      if (!attMap.has(a.studentAdmissionNumber)) attMap.set(a.studentAdmissionNumber, []);
      attMap.get(a.studentAdmissionNumber).push(a);
    }

    const notesMap = new Map();
    for (const n of allNotes) {
      if (!notesMap.has(n.studentAdmissionNumber)) notesMap.set(n.studentAdmissionNumber, []);
      notesMap.get(n.studentAdmissionNumber).push(n);
    }

    return students.map(s => {
      const studentAtt = attMap.get(s.admissionNumber) || [];
      const totalAtt = studentAtt.length;
      const presentCount = studentAtt.filter(att => att.status === 'PRESENT').length;
      const attendancePercent = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 1000) / 10 : 90;

      const marksAvg = 82;
      const isAtRisk = attendancePercent < 75 || s.riskLevel === 'HIGH';
      const calculatedRisk = isAtRisk ? 'HIGH' : (attendancePercent < 80 ? 'MODERATE' : 'LOW');

      const studentNotes = notesMap.get(s.admissionNumber) || [];

      return {
        assignmentId: `${gfm._id}_${s.admissionNumber}`,
        studentId: s._id.toString(),
        admissionNumber: s.admissionNumber,
        fullName: s.fullName,
        grade: s.grade || 'Grade 9',
        section: s.section || 'A',
        rollNo: s.rollNo,
        attendancePercent,
        marksAverage: marksAvg,
        backlogCount: 0,
        riskLevel: calculatedRisk,
        latestNote: studentNotes[0] ? studentNotes[0].content : 'Initial mentorship baseline established.',
        notesCount: studentNotes.length
      };
    });
  }

  static async addNote(institutionId, data) {
    return MentorshipNote.create({
      institutionId,
      employeeCode: data.employeeCode || 'T-101',
      studentAdmissionNumber: data.studentAdmissionNumber || data.admissionNumber,
      noteType: data.noteType || 'ACADEMIC',
      content: data.content,
      actionPlan: data.actionPlan || null,
      isConfidential: !!data.isConfidential,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null
    });
  }

  static async getAtRiskAlerts(institutionId) {
    const atRiskStudents = await Student.find({
      institutionId,
      riskLevel: 'HIGH'
    }).lean();

    return atRiskStudents.map(s => ({
      admissionNumber: s.admissionNumber,
      fullName: s.fullName,
      classDivision: `${s.grade}-${s.section}`,
      gfmName: 'Faculty Mentor',
      riskReason: 'Chronic attendance dip (<75%)'
    }));
  }
}
export default GfmService;
