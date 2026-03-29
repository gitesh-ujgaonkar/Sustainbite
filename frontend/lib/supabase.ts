/**
 * Supabase Client — Frontend
 *
 * Initialized with NEXT_PUBLIC_ env vars (safe for browser).
 * Uses the anon key — RLS policies control access.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Storage uploads will fail.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
