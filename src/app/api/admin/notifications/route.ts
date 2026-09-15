import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { title, message, type } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Broadcast to all users
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')

    if (users && users.length > 0) {
      const inserts = users.map((u) => ({
        user_id: u.id,
        title: title.trim(),
        message: message.trim(),
        type: type || 'INFO',
        read: false,
      }))

      await supabaseAdmin.from('notifications').insert(inserts)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
