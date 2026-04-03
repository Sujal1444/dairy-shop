const requestLog = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

exports.authRateLimit = (req, res, next) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientKey =
    (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0].trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const recentRequests = (requestLog.get(clientKey) || []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    });
  }

  recentRequests.push(now);
  requestLog.set(clientKey, recentRequests);
  next();
};
