import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorEmail: { type: String, index: true },
  action: { type: String, required: true },
  resourceType: { type: String, default: 'GENERIC' },
  resourceId: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadataJson: { type: String, default: '{}' },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
