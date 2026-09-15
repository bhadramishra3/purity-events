const jwt = require('jsonwebtoken');
const { Client } = require('../models/Client');

// Verify JWT and attach user to request
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Client.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found. Token invalid.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
};

// Admin-only access check (requires verifyToken first)
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// Optional auth — attaches user if token present, continues either way
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Client.findById(decoded.id).select('-password');
    if (user && user.isActive) req.user = user;
    next();
  } catch {
    next(); // Ignore invalid tokens for optional routes
  }
};

// Helper to sign a JWT for a user
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { verifyToken, requireAdmin, optionalAuth, signToken };
