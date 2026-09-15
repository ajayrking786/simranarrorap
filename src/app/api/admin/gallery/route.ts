import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { data: items, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: items || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch gallery' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, image_url, category, alt_text, published, display_order } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('gallery')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        image_url: image_url.trim(),
        category: category?.trim() || 'Editorial',
        alt_text: alt_text?.trim() || null,
        published: published ?? true,
        display_order: display_order || 0,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
