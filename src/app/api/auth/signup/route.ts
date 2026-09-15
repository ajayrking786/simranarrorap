import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    try {
      const supabase = await createServerClient()
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role: 'CUSTOMER',
          },
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Insert or upsert into public users table
      if (data.user) {
        await supabaseAdmin.from('users').upsert({
          id: data.user.id,
          email: trimmedEmail,
          full_name: fullName,
          phone: phone || null,
          role: 'CUSTOMER',
        })
      }

      const res = NextResponse.json({
        user: {
          id: data.user?.id,
          email: trimmedEmail,
          full_name: fullName,
          role: 'CUSTOMER',
        },
      })

      res.cookies.set('simran_session_role', 'CUSTOMER', {
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
      return NextResponse.json({ error: 'Signup service unavailable' }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
