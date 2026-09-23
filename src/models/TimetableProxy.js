import mongoose from 'mongoose';

const TimetableProxySchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  assignedEmployeeCode: { type: String, required: true, index: true },
  periodNumber: { type: Number, default: 1 },
  timeSlot: { type: String, default: 'Period 4 (11:15 AM)' },
  divisionName: { type: String, default: 'Grade 8-B' },
  subjectName: { type: String, default: 'Science' },
  absentTeacherName: { type: String, required: true },
  lessonHandover: { type: String, default: 'Supervised self-study worksheet' },
  status: { type: String, default: 'ASSIGNED', enum: ['ASSIGNED', 'COMPLETED', 'CANCELLED'] }
}, { timestamps: true });

export const TimetableProxy = mongoose.models.TimetableProxy || mongoose.model('TimetableProxy', TimetableProxySchema);
export default TimetableProxy;
