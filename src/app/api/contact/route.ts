import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendContactMessageAck } from '@/services/emailService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Name, email, subject, and message are required' }, { status: 400 })
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        archived: false,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to store contact message:', error)
      return NextResponse.json({ error: 'Failed to submit contact message' }, { status: 500 })
    }

    // Send acknowledgment email (non-blocking)
    sendContactMessageAck({
      id: inserted.id,
      name,
      email,
      phone: phone || null,
      subject,
      message,
      archived: false,
      created_at: inserted.created_at,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
