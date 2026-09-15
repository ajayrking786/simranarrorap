import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { data: prices, error } = await supabaseAdmin
      .from('price_options')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prices: prices || [] })
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
    const { service_id, name, description, amount, currency, enabled } = body

    if (!service_id || !name || amount === undefined) {
      return NextResponse.json({ error: 'Service ID, name, and amount are required' }, { status: 400 })
    }

    const { data: priceOption, error } = await supabaseAdmin
      .from('price_options')
      .insert({
        service_id,
        name: name.trim(),
        description: description?.trim() || null,
        amount: Number(amount),
        currency: currency || 'INR',
        enabled: enabled ?? true,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ price: priceOption })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
