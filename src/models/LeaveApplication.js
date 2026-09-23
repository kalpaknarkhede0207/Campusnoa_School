import mongoose from 'mongoose';

const LeaveApplicationSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  applicantEmployeeCode: { type: String, required: true, index: true },
  applicantName: { type: String, required: true },
  delegatedEmployeeCode: { type: String, default: 'N/A' },
  delegatedName: { type: String, default: 'Unassigned' },
  leaveType: {
    type: String,
    default: 'CASUAL',
    enum: ['CASUAL', 'MEDICAL', 'DUTY']
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  delegationStatus: {
    type: String,
    default: 'ACCEPTED',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED']
  },
  principalStatus: {
    type: String,
    default: 'APPROVED',
    enum: ['PENDING', 'APPROVED', 'REJECTED']
  }
}, { timestamps: true });

export const LeaveApplication = mongoose.models.LeaveApplication || mongoose.model('LeaveApplication', LeaveApplicationSchema);
export default LeaveApplication;
