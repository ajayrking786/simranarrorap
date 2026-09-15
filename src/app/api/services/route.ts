import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { data: services, error } = await supabaseAdmin
      .from('services')
      .select('*, price_options(*)')
      .eq('enabled', true)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ services: [] })
    }

    return NextResponse.json({ services: services || [] })
  } catch {
    return NextResponse.json({ services: [] })
  }
}
