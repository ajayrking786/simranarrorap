import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { data: videos, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ videos: videos || [] })
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
    const { title, description, thumbnail_url, video_url, platform, button_label, published, display_order } = body

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 })
    }

    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        thumbnail_url: thumbnail_url?.trim() || null,
        video_url: video_url.trim(),
        platform: platform?.trim() || 'YouTube',
        button_label: button_label?.trim() || 'Watch Now',
        published: published ?? true,
        display_order: display_order || 0,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
