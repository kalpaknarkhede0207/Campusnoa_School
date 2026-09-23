import mongoose from 'mongoose';

const GfmSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, unique: true, index: true },
  employeeCode: { type: String, required: true, index: true },
  academicYear: { type: String, default: '2026-2027' },
  maxMentees: { type: Number, default: 20 },
  menteeAdmissionNumbers: [{ type: String, index: true }]
}, { timestamps: true });

export const Gfm = mongoose.models.Gfm || mongoose.model('Gfm', GfmSchema);
export default Gfm;
