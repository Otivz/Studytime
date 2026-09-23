import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id: string, email: string }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Middleware to ensure the authenticated user matches the userId param
 */
export function authorizeUser(paramKey = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated.' });
    }
    const requestedUserId = req.params[paramKey];
    if (requestedUserId && requestedUserId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot access or modify another user\'s resources.' });
    }
    next();
  };
}
