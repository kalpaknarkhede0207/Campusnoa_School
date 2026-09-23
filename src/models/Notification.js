import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  institutionId: { type: String, required: true, index: true },
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientEmail: { type: String, index: true },
  type: {
    type: String,
    default: 'ANNOUNCEMENT',
    enum: ['ANNOUNCEMENT', 'LEAVE_ALERT', 'ATTENDANCE_ALERT', 'PROXY_ASSIGNED', 'FEE_ALERT', 'COUNSELLING_ALERT', 'SYSTEM']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  linkUrl: { type: String }
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
