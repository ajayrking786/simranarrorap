import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { data: pages, error } = await supabaseAdmin
      .from('legal_pages')
      .select('*')

    if (error) return NextResponse.json({ pages: [] })
    return NextResponse.json({ pages: pages || [] })
  } catch {
    return NextResponse.json({ pages: [] })
  }
}
