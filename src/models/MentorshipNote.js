import mongoose from 'mongoose';

const MentorshipNoteSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  employeeCode: { type: String },
  studentAdmissionNumber: { type: String, required: true, index: true },
  noteType: {
    type: String,
    default: 'PASTORAL',
    index: true
  },
  content: { type: String, required: true },
  actionPlan: { type: String },
  isConfidential: { type: Boolean, default: false }, // Only Counsellor / Principal if true
  followUpDate: { type: Date }
}, { timestamps: true });

export const MentorshipNote = mongoose.models.MentorshipNote || mongoose.model('MentorshipNote', MentorshipNoteSchema);
export default MentorshipNote;
