const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d' // Refresh token expires in 30 days
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Decode JWT token without verification (for expired tokens)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Generate password reset token
 * @param {Object} user - User object
 * @returns {string} Password reset token
 */
const generatePasswordResetToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    type: 'password-reset'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h' // Password reset token expires in 1 hour
  });
};

/**
 * Generate email verification token
 * @param {Object} user - User object
 * @returns {string} Email verification token
 */
const generateEmailVerificationToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    type: 'email-verification'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h' // Email verification token expires in 24 hours
  });
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  generatePasswordResetToken,
  generateEmailVerificationToken
};