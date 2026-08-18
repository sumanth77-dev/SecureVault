import { shareService } from '../services/shareService.js';

export const publicController = {
  /**
   * Get public document link metadata
   */
  async getShareInfo(req, res, next) {
    try {
      const { token } = req.params;
      const info = await shareService.getPublicShareInfo(token);
      res.status(200).json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unlock password-protected document
   */
  async unlockShare(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await shareService.unlockPublicShare(token, password);
      res.status(200).json({
        success: true,
        message: 'Document unlocked successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Download shared document
   */
  async downloadShare(req, res, next) {
    try {
      const { token } = req.params;
      const unlockToken = req.headers['x-unlock-token'] || req.query.unlockToken;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Public Recipient';

      const result = await shareService.getPublicDownloadUrl(token, unlockToken, {
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Preview shared document
   */
  async previewShare(req, res, next) {
    try {
      const { token } = req.params;
      const unlockToken = req.headers['x-unlock-token'] || req.query.unlockToken;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Public Recipient';

      const result = await shareService.getPublicPreviewUrl(token, unlockToken, {
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};
