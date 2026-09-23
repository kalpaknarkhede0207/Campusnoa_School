// In-memory sliding window rate limiter for brute-force protection
const loginAttempts = new Map();

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50;

  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: `Too many login attempts from this IP address. Account security cooldown active. Try again in ${retryAfterSec} seconds.`
    });
  }

  record.count += 1;
  loginAttempts.set(ip, record);
  next();
};

export const resetLoginAttempts = (ip) => {
  if (ip && loginAttempts.has(ip)) {
    loginAttempts.delete(ip);
  }
};
