import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const { data: links, error } = await supabaseAdmin
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ links: links || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { links } = await req.json()
    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Links array required' }, { status: 400 })
    }

    for (const link of links) {
      await supabaseAdmin
        .from('social_links')
        .update({
          url: link.url || null,
          enabled: link.enabled ?? false,
          display_order: link.display_order || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', link.id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
