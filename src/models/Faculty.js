import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  employeeCode: { type: String, required: true, unique: true, index: true },
  designationTier: {
    type: String,
    default: 'TGT'
  },
  joiningDate: { type: Date, default: Date.now },
  department: { type: String, default: 'General Faculty' },
  qualification: { type: String, default: 'M.Sc, B.Ed' },
  experienceYears: { type: Number, default: 5 },
  tetCertificationId: { type: String, default: 'CTET-PAPER-II-98214' },
  presenceStatus: {
    type: String,
    default: 'PRESENT',
    enum: ['PRESENT', 'ON_LEAVE', 'SUBSTITUTING']
  },
  homeroomDivision: { type: String, default: 'None' }, // e.g. "Grade 9-A"
  maxWeeklyProxies: { type: Number, default: 3 },
  assignedClasses: [{
    grade: { type: String, default: 'Grade 9' },
    section: { type: String, default: 'A' },
    role: { type: String, default: 'Subject Teacher' },
    subject: { type: String, default: 'General' }
  }],
  classReport: {
    syllabusCompletionPercent: { type: Number, default: 85 },
    classAverageScore: { type: Number, default: 82.5 },
    attendanceRate: { type: Number, default: 94.0 },
    studentsCount: { type: Number, default: 10 }
  }
}, { timestamps: true });

export const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
export default Faculty;
