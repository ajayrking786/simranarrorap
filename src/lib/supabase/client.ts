// ─────────────────────────────────────────────
//  Simran Arrora – Browser Supabase Client
//  Target: src/lib/supabase/client.ts
// ─────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/**
 * Create a fresh browser-side Supabase client.
 * Reads auth tokens from cookies automatically (handled by @supabase/ssr).
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Singleton browser client for convenience.
 * Safe to call outside React (e.g. in utility files or event handlers).
 */
export const supabase = createClient()
