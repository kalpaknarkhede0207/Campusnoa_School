import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  auth0Sub: { type: String, sparse: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String }, // For direct login / fallback
  fullName: { type: String, required: true },
  phone: { type: String },
  roleCode: {
    type: String,
    required: true,
    enum: [
      'SUPER_ADMIN', 'SCHOOL_MGMT', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL',
      'HOD', 'GFM_COORDINATOR', 'ACCOUNTANT', 'ADMIN_OFFICER', 'COUNSELLOR',
      'CLASS_TEACHER', 'GFM', 'TEACHER', 'STAFF', 'PARENT', 'STUDENT'
    ],
    index: true
  },
  status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'] },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  emailVerified: { type: Boolean, default: true }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
