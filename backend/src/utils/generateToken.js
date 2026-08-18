import jwt from 'jsonwebtoken';

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || 'securevault_fallback_access_secret_2026';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'securevault_fallback_refresh_secret_2026';

/**
 * Generates short-lived Access Token containing minimal required claims (userId only)
 */
export function generateAccessToken(userId) {
  return jwt.sign(
    { userId },
    getAccessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' }
  );
}

/**
 * Generates Refresh Token
 */
export function generateRefreshToken(userId) {
  return jwt.sign(
    { userId },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

/**
 * Verifies and decodes an Access Token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, getAccessSecret());
}

/**
 * Verifies and decodes a Refresh Token
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, getRefreshSecret());
}
