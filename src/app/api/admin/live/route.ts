import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('live_settings')
      .select('*')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ settings: null })
    }

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ settings: null })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const body = await req.json()

    // Upsert or update single live_settings row
    const { data: existing } = await supabaseAdmin
      .from('live_settings')
      .select('id')
      .maybeSingle()

    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from('live_settings')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ settings: updated })
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from('live_settings')
        .insert({ ...body })
        .select('*')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ settings: inserted })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
