import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Strict Bearer JWT token verification middleware
export const verifyToken = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'mysecretkey12345'
    );

    // Verify user exists and account is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User account no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired: Please log in again',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or tampered token',
    });
  }
};

// Strict Role-Based Access Control (RBAC) middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role`,
      });
    }

    next();
  };
};

// Simple rate limiter for login brute-force protection
const loginAttemptsMap = new Map();

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'client-ip';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minute window
  const maxAttempts = 10; // Max 10 attempts per 15 mins

  if (!loginAttemptsMap.has(ip)) {
    loginAttemptsMap.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  const record = loginAttemptsMap.get(ip);
  if (now - record.firstAttempt > windowMs) {
    loginAttemptsMap.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Please try again after 15 minutes.',
    });
  }

  record.count += 1;
  next();
};
