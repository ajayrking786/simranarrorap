import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { data: services, error } = await supabaseAdmin
      .from('services')
      .select('*, price_options(*)')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ services: services || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, duration_minutes, enabled, display_order } = body

    if (!name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
    }

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        duration_minutes: duration_minutes || null,
        enabled: enabled ?? true,
        display_order: display_order || 0,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
