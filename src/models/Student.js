import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admissionNumber: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String },
  grade: { type: String, default: 'Grade 9' },
  section: { type: String, default: 'A' },
  rollNo: { type: Number, default: 1 },
  dob: { type: String, default: '2012-05-15' },
  gender: { type: String, default: 'Male' },
  bloodGroup: { type: String, default: 'B+' },
  parentName: { type: String },
  parentWhatsApp: { type: String },
  parentEmail: { type: String },
  address: { type: String },
  allergies: { type: String, default: 'None reported' },
  busRoute: { type: String, default: 'Self Walker' },
  admissionStatus: { type: String, default: 'APPROVED', enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'] },
  riskLevel: { type: String, default: 'LOW', enum: ['LOW', 'MODERATE', 'HIGH'] }
}, { timestamps: true });

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;
