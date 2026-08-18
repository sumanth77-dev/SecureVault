import { verifyAccessToken } from '../utils/generateToken.js';
import { db } from '../config/database.js';

export async function authenticateToken(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.sv_access_token) {
      token = req.cookies.sv_access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired. Please refresh your session.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.'
      });
    }

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Malformed token payload.'
      });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticateToken(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.sv_access_token) {
      token = req.cookies.sv_access_token;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        if (decoded?.userId) {
          const user = await db.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true }
          });
          if (user) req.user = user;
        }
      } catch (e) {
        // Ignore invalid optional token
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
