import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './app.config';

// Polyfill WebSocket for Node.js < 22 (required by Supabase realtime client)
// biome-ignore lint/suspicious/noGlobalAssign: Supabase requires WebSocket polyfill on Node < 22
;(globalThis as any).WebSocket = require('ws');

export const supabase: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

export default supabase;
