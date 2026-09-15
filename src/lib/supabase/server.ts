// ─────────────────────────────────────────────
//  Simran Arrora – Server-side Supabase Client
//  Target: src/lib/supabase/server.ts
// ─────────────────────────────────────────────

import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a server-side Supabase client bound to the current request's cookie store.
 * Must be called from a Next.js Server Component, Route Handler, or Server Action
 * (anywhere `next/headers` cookies() is available).
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Same as above — safe to ignore in Server Components.
          }
        },
      },
    },
  )
}
