import { z } from 'zod';
import { authService } from '../services/authService.js';
import { logger } from '../utils/logger.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  ...(maxAge !== undefined ? { maxAge } : {})
});

export const authController = {
  /**
   * Standard Email & Password Registration
   */
  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      // Set secure HTTP-only cookies
      res.cookie('sv_access_token', result.accessToken, getCookieOptions(60 * 60 * 1000));
      res.cookie('sv_refresh_token', result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Standard Email & Password Login
   */
  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await authService.login({
        email: validated.email,
        password: validated.password,
        ipAddress,
        userAgent
      });

      res.cookie('sv_access_token', result.accessToken, getCookieOptions(60 * 60 * 1000));
      res.cookie('sv_refresh_token', result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Initiate Google OAuth 2.0 Flow (Redirect to Google)
   */
  async initiateGoogleAuth(req, res, next) {
    try {
      const { url, state } = authService.getGoogleAuthUrl();
      const cookieOptions = getCookieOptions(15 * 60 * 1000);

      logger.info(`[OAuth Init] Setting sv_oauth_state cookie: secure=${cookieOptions.secure}, sameSite=${cookieOptions.sameSite}, path=${cookieOptions.path}`);

      // Store CSRF state parameter in secure cookie
      res.cookie('sv_oauth_state', state, cookieOptions);

      res.redirect(302, url);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle Google OAuth 2.0 Callback (Code Exchange & Login/Register)
   */
  async googleCallback(req, res, next) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      const { code, state, error, error_description } = req.query;
      const cookieState = req.cookies?.sv_oauth_state;

      // Safe diagnostic logging (NEVER logs any secret or state values)
      logger.info(`[OAuth Callback] Cookies object present: ${Boolean(req.cookies)}, sv_oauth_state present: ${Boolean(cookieState)}, query.state present: ${Boolean(state)}, state matched: ${Boolean(cookieState && state && cookieState === state)}`);

      // Clear state cookie with matching attributes
      res.clearCookie('sv_oauth_state', getCookieOptions());

      if (error) {
        logger.warn(`Google OAuth redirected with error: ${error} - ${error_description}`);
        const userFacingError = error === 'access_denied' ? 'cancelled' : (error_description || error);
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(userFacingError)}`);
      }

      if (!code || !state) {
        return res.redirect(`${frontendUrl}/login?error=missing_oauth_code`);
      }

      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await authService.handleGoogleCallback({
        code,
        state,
        cookieState,
        ipAddress,
        userAgent
      });

      res.cookie('sv_access_token', result.accessToken, getCookieOptions(60 * 60 * 1000));
      res.cookie('sv_refresh_token', result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      res.redirect(`${frontendUrl}/login?auth=success`);
    } catch (err) {
      logger.error('Google OAuth callback error:', err.message);
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message || 'OAuth authentication failed')}`);
    }
  },

  /**
   * Log out user and clear authentication cookies
   */
  async logout(req, res) {
    res.clearCookie('sv_access_token', getCookieOptions());
    res.clearCookie('sv_refresh_token', getCookieOptions());
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  },

  /**
   * Refresh session tokens
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.sv_refresh_token;
      const result = await authService.refresh(refreshToken);

      res.cookie('sv_access_token', result.accessToken, getCookieOptions(60 * 60 * 1000));

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current authenticated user
   */
  async getMe(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Request password reset token
   */
  async forgotPassword(req, res, next) {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(validated.email);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password using token
   */
  async resetPassword(req, res, next) {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validated);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};
