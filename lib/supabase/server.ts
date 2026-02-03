import { createClient } from '@supabase/supabase-js';
import { Database } from './client';

// Supabase client for server-side operations with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables.');
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Helper to get server-side Supabase client
export function getSupabaseServer() {
    return supabaseAdmin;
}
