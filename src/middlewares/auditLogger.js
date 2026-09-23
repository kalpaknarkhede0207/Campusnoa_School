import { AuditLog } from '../models/AuditLog.js';

export const auditLogger = (action, resourceType) => {
  return async (req, res, next) => {
    // Wrap res.end to record audit log only upon successful response (2xx/3xx)
    const originalEnd = res.end;
    res.end = function (...args) {
      originalEnd.apply(this, args);

      if (res.statusCode >= 200 && res.statusCode < 400 && req.institutionId) {
        // Safe metadata without passwords or secrets
        const safeBody = { ...req.body };
        delete safeBody.password;
        delete safeBody.token;
        delete safeBody.refreshToken;

        AuditLog.create({
          institutionId: req.institutionId,
          actorUserId: req.user?._id || req.user?.id || null,
          actorEmail: req.user?.email || null,
          action: action || `${req.method}_${req.baseUrl}${req.path}`,
          resourceType: resourceType || 'GENERIC',
          resourceId: req.params.id || req.body?.id || null,
          ipAddress: req.ip || req.socket?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null,
          metadataJson: JSON.stringify({
            url: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            body: safeBody
          })
        }).catch(err => {
          console.error('[AUDIT_LOG_ERROR] Failed to persist audit record to MongoDB:', err.message);
        });
      }
    };

    next();
  };
};
