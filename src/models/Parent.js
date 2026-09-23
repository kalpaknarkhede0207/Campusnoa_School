import mongoose from 'mongoose';

const ParentSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  occupation: { type: String },
  emergencyContact: { type: String },
  address: { type: String },
  linkedStudentAdmissionNumbers: [{ type: String, index: true }]
}, { timestamps: true });

export const Parent = mongoose.models.Parent || mongoose.model('Parent', ParentSchema);
export default Parent;
