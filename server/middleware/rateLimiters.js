const rateLimit = require('express-rate-limit');

const make = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });

exports.apiLimiter = make(15 * 60 * 1000, 300, 'Too many requests. Please try again shortly.');
exports.authLimiter = make(15 * 60 * 1000, 20, 'Too many attempts. Please try again in a few minutes.');
exports.predictLimiter = make(60 * 1000, 20, 'Too many assessments in a short time. Please wait a minute.');
