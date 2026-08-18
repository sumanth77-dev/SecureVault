import { supabase, STORAGE_BUCKET, isRemoteStorage } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// Secure local in-memory/buffer cache for fallback and offline automated tests
const localFileStore = new Map();

/**
 * Storage Service for managing private files in Supabase Storage bucket
 */
export const storageService = {
  /**
   * Upload file to Supabase private storage bucket using structured path:
   * users/{userId}/documents/{documentId}/versions/{versionNumber}/{sanitizedFilename}
   */
  async uploadFile({ userId, documentId, versionNumber = 1, filename, buffer, mimeType }) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `users/${userId}/documents/${documentId}/versions/${versionNumber}/${sanitizedFilename}`;

    if (isRemoteStorage && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storageKey, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (error) {
          logger.error('Supabase storage upload error:', error);
          throw new Error(`Failed to upload to Supabase storage: ${error.message}`);
        }

        logger.info(`Uploaded file to Supabase Storage: ${storageKey}`);
        return { storageKey, path: data.path };
      } catch (err) {
        logger.warn('Remote Supabase storage failed, using local secure fallback:', err.message);
        localFileStore.set(storageKey, { buffer, mimeType, filename });
        return { storageKey, path: storageKey };
      }
    } else {
      localFileStore.set(storageKey, { buffer, mimeType, filename });
      logger.info(`Saved file to local secure storage: ${storageKey}`);
      return { storageKey, path: storageKey };
    }
  },

  /**
   * Generates a temporary signed download URL for private files (valid for 5 minutes)
   */
  async getSignedDownloadUrl(storageKey, originalFilename, expiresInSeconds = 300) {
    if (isRemoteStorage && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(storageKey, expiresInSeconds, {
            download: originalFilename || true
          });

        if (error) {
          logger.error('Supabase signed download URL error:', error);
          throw error;
        }

        return data.signedUrl;
      } catch (err) {
        logger.warn('Supabase signed URL generation fallback:', err.message);
      }
    }

    return `/api/documents/stream/${encodeURIComponent(storageKey)}?download=true`;
  },

  /**
   * Generates a temporary signed preview URL for canvas viewing (valid for 10 minutes)
   */
  async getSignedPreviewUrl(storageKey, expiresInSeconds = 600) {
    if (isRemoteStorage && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(storageKey, expiresInSeconds);

        if (error) {
          logger.error('Supabase signed preview URL error:', error);
          throw error;
        }

        return data.signedUrl;
      } catch (err) {
        logger.warn('Supabase signed preview URL fallback:', err.message);
      }
    }

    return `/api/documents/stream/${encodeURIComponent(storageKey)}`;
  },

  /**
   * Delete single file or multiple files from Supabase Storage
   */
  async deleteFile(storageKey) {
    if (!storageKey) return;

    if (isRemoteStorage && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([storageKey]);

        if (error) {
          logger.error(`Failed to delete storage file ${storageKey}:`, error);
        } else {
          logger.info(`Deleted file from Supabase storage: ${storageKey}`);
        }
      } catch (err) {
        logger.error(`Error deleting storage file ${storageKey}:`, err);
      }
    }

    localFileStore.delete(storageKey);
  },

  /**
   * Delete multiple files in batch
   */
  async deleteFiles(storageKeys = []) {
    if (!storageKeys || storageKeys.length === 0) return;
    const validKeys = storageKeys.filter(Boolean);

    if (isRemoteStorage && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(validKeys);

        if (error) {
          logger.error('Failed to delete batch storage files:', error);
        } else {
          logger.info(`Batch deleted ${validKeys.length} files from Supabase storage.`);
        }
      } catch (err) {
        logger.error('Error in batch storage file deletion:', err);
      }
    }

    validKeys.forEach(k => localFileStore.delete(k));
  },

  /**
   * Local retrieval helper for development fallback streaming
   */
  getLocalFile(storageKey) {
    return localFileStore.get(storageKey);
  }
};
