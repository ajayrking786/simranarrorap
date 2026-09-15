import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')

    if (error) {
      return NextResponse.json({ settings: {} })
    }

    const settingsMap: Record<string, string | null> = {}
    rows?.forEach((r) => {
      settingsMap[r.key] = r.value
    })

    return NextResponse.json({ settings: settingsMap })
  } catch {
    return NextResponse.json({ settings: {} })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const body = await req.json()

    for (const [key, value] of Object.entries(body)) {
      await supabaseAdmin
        .from('site_settings')
        .upsert(
          { key, value: String(value), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
