import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

// Polyfill minimal WebSocket if running on Node.js without native websocket support
if (typeof global !== 'undefined' && !global.WebSocket) {
  global.WebSocket = class DummyWebSocket {
    constructor() {}
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'securevault';

let supabaseClient = null;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseServiceKey.includes('placeholder')
);

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    logger.info('Supabase Storage Client initialized with Service Role credentials.');
  } catch (err) {
    logger.error('Failed to initialize Supabase client:', err);
  }
} else {
  logger.warn('Supabase credentials not set or using placeholders. Storage Service will operate in local secure fallback mode.');
}

export const supabase = supabaseClient;
export const isRemoteStorage = isSupabaseConfigured && Boolean(supabaseClient);
