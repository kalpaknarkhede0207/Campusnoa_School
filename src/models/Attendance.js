import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  divisionName: { type: String, required: true, index: true }, // e.g. "Grade 1-A"
  studentAdmissionNumber: { type: String, required: true, index: true },
  recordedByEmployeeCode: { type: String },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  periodNumber: { type: Number, default: 1 },
  status: {
    type: String,
    default: 'PRESENT',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
    index: true
  },
  remarks: { type: String }
}, { timestamps: true });

// Compound unique index for idempotent batch saves
AttendanceSchema.index(
  { divisionName: 1, studentAdmissionNumber: 1, date: 1, periodNumber: 1 },
  { unique: true }
);

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
