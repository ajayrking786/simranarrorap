// ─────────────────────────────────────────────
//  Simran Arrora – Supabase Admin Client
//  Target: src/lib/supabase/admin.ts
//
//  !! SERVER-ONLY !!  Never import this file from client components.
//  The service role key bypasses Row Level Security.
// ─────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[supabaseAdmin] Running with fallback placeholder credentials.')
  }
}

/**
 * Supabase admin client with the service role key.
 * Bypasses RLS — use only for server-side privileged operations.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
