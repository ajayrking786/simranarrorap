import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    const emailCookie = req.cookies.get('simran_session_email')?.value

    if (!roleCookie || !emailCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Special admin check
    if (roleCookie === 'ADMIN' && emailCookie === process.env.ADMIN_EMAIL?.toLowerCase()) {
      return NextResponse.json({
        user: {
          id: 'admin-bootstrap-id',
          email: emailCookie,
          full_name: 'Simran Arrora (Admin)',
          role: 'ADMIN',
        },
      })
    }

    try {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', emailCookie)
        .maybeSingle()

      if (userProfile) {
        return NextResponse.json({
          user: {
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name,
            phone: userProfile.phone,
            role: userProfile.role,
          },
        })
      }
    } catch {}

    return NextResponse.json({
      user: {
        id: 'session-id',
        email: emailCookie,
        full_name: emailCookie.split('@')[0],
        role: roleCookie,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
