import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore if unconfigured
  }

  const res = NextResponse.json({ success: true })
  res.cookies.delete('simran_session_role')
  res.cookies.delete('simran_session_email')
  return res
}
