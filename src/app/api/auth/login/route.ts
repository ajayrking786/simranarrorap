import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // 1. Check if matches configured ADMIN_EMAIL & ADMIN_PASSWORD for fallback bootstrap
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const adminPass = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPass && trimmedEmail === adminEmail && password === adminPass) {
      // Set session cookie for admin
      const res = NextResponse.json({
        user: {
          id: 'admin-bootstrap-id',
          email: adminEmail,
          full_name: 'Simran Arrora (Admin)',
          role: 'ADMIN',
        },
      })
      res.cookies.set('simran_session_role', 'ADMIN', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      res.cookies.set('simran_session_email', adminEmail, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      return res
    }

    // 2. Supabase Auth attempt
    try {
      const supabase = await createServerClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (error || !data.user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Fetch user profile to get role
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', trimmedEmail)
        .maybeSingle()

      const role = userProfile?.role || 'CUSTOMER'

      const res = NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: userProfile?.full_name || data.user.user_metadata?.full_name,
          role,
        },
      })

      res.cookies.set('simran_session_role', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      res.cookies.set('simran_session_email', trimmedEmail, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return res
    } catch {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 401 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
