import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { data: customers, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, created_at')
      .eq('role', 'CUSTOMER')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ customers: customers || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch customers' }, { status: 500 })
  }
}
