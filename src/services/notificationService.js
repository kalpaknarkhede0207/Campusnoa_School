import { Notification } from '../models/Notification.js';

// Server-Sent Events (SSE) Client Pool
const sseClients = new Map(); // userId string -> Set of res objects

export class NotificationService {
  static addSseClient(userId, res) {
    const key = userId.toString();
    if (!sseClients.has(key)) {
      sseClients.set(key, new Set());
    }
    sseClients.get(key).add(res);

    res.on('close', () => {
      const userConns = sseClients.get(key);
      if (userConns) {
        userConns.delete(res);
        if (userConns.size === 0) sseClients.delete(key);
      }
    });
  }

  static async sendNotification(institutionId, recipientUserId, { type, title, message, linkUrl, recipientEmail }) {
    // 1. Save to MongoDB
    const record = await Notification.create({
      institutionId,
      recipientUserId: recipientUserId || null,
      recipientEmail: recipientEmail || null,
      type: type || 'ANNOUNCEMENT',
      title,
      message,
      linkUrl: linkUrl || null
    });

    // 2. Real-time push if client is connected to SSE
    const key = recipientUserId ? recipientUserId.toString() : null;
    if (key && sseClients.has(key)) {
      const payload = `data: ${JSON.stringify({ type: 'NOTIFICATION', data: record })}\n\n`;
      sseClients.get(key).forEach(res => {
        try { res.write(payload); } catch (e) { /* client stream disconnected */ }
      });
    }

    return record;
  }

  static async broadcastInstitutionEvent(institutionId, eventType, data) {
    const payload = `data: ${JSON.stringify({ type: eventType, data })}\n\n`;
    sseClients.forEach((conns) => {
      conns.forEach(res => {
        try { res.write(payload); } catch (e) { /* ignore */ }
      });
    });
  }

  static async getUnreadNotifications(userId) {
    return Notification.find({
      $or: [
        { recipientUserId: userId },
        { recipientEmail: userId }
      ],
      isRead: false
    }).sort({ createdAt: -1 }).lean();
  }
}
export default NotificationService;
