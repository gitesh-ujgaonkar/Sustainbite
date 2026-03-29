/**
 * Supabase Client — Frontend (Crash-Safe)
 *
 * Uses NEXT_PUBLIC_ env vars (safe for browser).
 * If env vars are missing (e.g. during build or misconfigured deploy),
 * the client is still created but operations will fail gracefully
 * instead of crashing the entire app on load.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create client with a fallback placeholder URL to prevent crash-on-import.
// The placeholder will cause API calls to fail with a clear error, but
// won't crash the app at module load time (which kills SSG builds).
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
);
