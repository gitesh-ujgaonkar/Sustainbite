/**
 * Supabase Client — Frontend (Lazy Initialized)
 *
 * Uses NEXT_PUBLIC_ env vars (safe for browser).
 * Client is created lazily to avoid build-time errors when
 * env vars aren't available during Next.js static generation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_client) {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

            if (!url || !key) {
                throw new Error(
                    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
                    'Add them to frontend/.env.local'
                );
            }

            _client = createClient(url, key);
        }
        return (_client as any)[prop];
    },
});
