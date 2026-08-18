import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Hash plain text password using bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with bcrypt hash
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}

/**
 * Generate cryptographically secure random string token
 */
export function generateSecureToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Hash a token with SHA-256 for secure database storage & fast lookup
 */
export function hashToken(token) {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
}
