import crypto from 'crypto';
import { db } from '../config/database.js';
import { hashPassword, comparePassword, generateSecureToken } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { logger } from '../utils/logger.js';

// In-memory store for password reset tokens
const passwordResetTokens = new Map();

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register({ name, email, password, phone }) {
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null,
        authProvider: 'LOCAL',
        twoFactorEnabled: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        authProvider: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    });

    // Create default folders for new user
    await db.folder.createMany({
      data: [
        { userId: user.id, name: 'Personal', color: 'blue', description: 'Personal identification and documents' },
        { userId: user.id, name: 'Financial', color: 'emerald', description: 'Tax, banking and financial statements' },
        { userId: user.id, name: 'Legal', color: 'purple', description: 'Contracts and agreements' }
      ]
    });

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to SecureVault',
        message: 'Your end-to-end encrypted document vault is ready.',
        type: 'SYSTEM'
      }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken
    };
  },

  /**
   * Login user with credentials
   */
  async login({ email, password, ipAddress, userAgent }) {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.passwordHash) {
      const error = new Error('This account was created with Google Sign-In. Please sign in using Google.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Create Audit Log for login
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Browser',
          details: 'User authenticated successfully with email/password'
        }
      });
    } catch (e) {
      logger.error('Failed to create audit log for login:', e);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        authProvider: user.authProvider || 'LOCAL',
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Generate Google OAuth 2.0 Authorization URL with CSRF state protection
   */
  getGoogleAuthUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    if (!clientId) {
      const error = new Error('GOOGLE_CLIENT_ID is not configured on the backend.');
      error.statusCode = 500;
      throw error;
    }

    // Cryptographic state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state
    });

    return {
      url: `${rootUrl}?${params.toString()}`,
      state
    };
  },

  /**
   * Handle Google OAuth 2.0 callback, exchange code, verify identity, and create/link account
   */
  async handleGoogleCallback({ code, state, cookieState, ipAddress, userAgent }) {
    if (!state || !cookieState || state !== cookieState) {
      const error = new Error('Invalid OAuth state parameter. Potential CSRF attack detected.');
      error.statusCode = 403;
      throw error;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      const error = new Error('Google OAuth credentials not configured on the backend.');
      error.statusCode = 500;
      throw error;
    }

    // Step 1: Exchange authorization code with Google token endpoint
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      const error = new Error(tokenData.error_description || 'Failed to exchange authorization code with Google.');
      error.statusCode = 401;
      throw error;
    }

    // Step 2: Retrieve verified Google user profile using access token
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleProfile = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleProfile.sub) {
      const error = new Error('Failed to retrieve verified user profile from Google.');
      error.statusCode = 401;
      throw error;
    }

    if (!googleProfile.email_verified) {
      const error = new Error('Google account email address is not verified.');
      error.statusCode = 403;
      throw error;
    }

    const googleId = googleProfile.sub;
    const email = googleProfile.email.toLowerCase().trim();
    const name = googleProfile.name || (email.split('@')[0]) || 'Google User';
    const avatarUrl = googleProfile.picture || null;

    // Step 3: Check if account exists by googleId
    let user = await db.user.findFirst({
      where: { googleId }
    });

    if (user) {
      // Existing Google user - update avatar if changed
      if (avatarUrl && user.avatarUrl !== avatarUrl) {
        user = await db.user.update({
          where: { id: user.id },
          data: { avatarUrl }
        });
      }
    } else {
      // Step 4: Check if account exists with the same verified email (Account Linking)
      const existingEmailUser = await db.user.findUnique({
        where: { email }
      });

      if (existingEmailUser) {
        // Safely link Google ID to existing account
        user = await db.user.update({
          where: { id: existingEmailUser.id },
          data: {
            googleId,
            avatarUrl: existingEmailUser.avatarUrl || avatarUrl
          }
        });
        logger.info(`Linked Google ID to existing account for email: ${email}`);
      } else {
        // Step 5: Create brand new Google user
        user = await db.user.create({
          data: {
            name,
            email,
            googleId,
            authProvider: 'GOOGLE',
            avatarUrl,
            twoFactorEnabled: false
          }
        });

        // Initialize default folders
        await db.folder.createMany({
          data: [
            { userId: user.id, name: 'Personal', color: 'blue', description: 'Personal identification and documents' },
            { userId: user.id, name: 'Financial', color: 'emerald', description: 'Tax, banking and financial statements' },
            { userId: user.id, name: 'Legal', color: 'purple', description: 'Contracts and agreements' }
          ]
        });

        // Welcome notification
        await db.notification.create({
          data: {
            userId: user.id,
            title: 'Welcome to SecureVault',
            message: 'Your Google-authenticated encrypted vault is ready.',
            type: 'SYSTEM'
          }
        });

        logger.info(`Created new SecureVault user via Google OAuth for email: ${email}`);
      }
    }

    // Step 6: Log audit entry
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Browser',
          details: 'User authenticated via Google OAuth 2.0'
        }
      });
    } catch (e) {
      logger.error('Failed to create audit log for Google OAuth login:', e);
    }

    // Step 7: Issue SecureVault session tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        authProvider: user.authProvider || 'GOOGLE',
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Refresh session using refresh token
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required.');
      error.statusCode = 400;
      throw error;
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded?.userId) {
      const error = new Error('Invalid refresh token.');
      error.statusCode = 401;
      throw error;
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        authProvider: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      const error = new Error('User no longer exists.');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  /**
   * Request password reset token
   */
  async forgotPassword(email) {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return { message: 'If an account exists, a reset link has been dispatched.' };
    }

    const resetToken = generateSecureToken(24);
    const expiresAt = Date.now() + 3600000; // 1 hour
    passwordResetTokens.set(resetToken, { userId: user.id, expiresAt });

    logger.info(`Password reset token generated for user ${user.id}: ${resetToken}`);

    return {
      message: 'Password reset link sent to registered email address.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    };
  },

  /**
   * Reset password with reset token
   */
  async resetPassword({ token, newPassword }) {
    const record = passwordResetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      const error = new Error('Invalid or expired password reset token.');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    });

    passwordResetTokens.delete(token);

    await db.auditLog.create({
      data: {
        userId: record.userId,
        action: 'PASSWORD_CHANGE',
        details: 'Password was reset via security reset link'
      }
    });

    return { message: 'Password has been reset successfully. Please log in.' };
  }
};
