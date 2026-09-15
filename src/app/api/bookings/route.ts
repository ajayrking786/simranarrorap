import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createBooking, getBookingsByCustomer, getAllBookings } from '@/services/bookingService'
import { syncBookingToSheet } from '@/services/sheetsService'
import { sendBookingReceived } from '@/services/emailService'
import { createNotification } from '@/services/notificationService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name,
      email,
      phone,
      service_id,
      price_option_id,
      appointment_date,
      appointment_time,
      notes,
      location,
    } = body

    if (!customer_name || !email || !phone || !service_id || !price_option_id || !appointment_date || !appointment_time) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    // Server-side price resolution — NEVER trust client-supplied amount
    let resolvedAmount = 15000
    let resolvedCurrency = 'INR'

    try {
      const { data: priceOption } = await supabaseAdmin
        .from('price_options')
        .select('amount, currency')
        .eq('id', price_option_id)
        .maybeSingle()

      if (priceOption) {
        resolvedAmount = Number(priceOption.amount)
        resolvedCurrency = priceOption.currency || 'INR'
      }
    } catch (e) {
      console.warn('Could not resolve price option, using fallback:', e)
    }

    // Optional customer ID from cookie
    let customerId: string | null = null
    const customerEmail = email.trim().toLowerCase()
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle()
      if (userProfile) {
        customerId = userProfile.id
      }
    } catch {}

    // 1. Create booking in Supabase
    const booking = await createBooking(
      {
        customer_name,
        email: customerEmail,
        phone,
        service_id,
        price_option_id,
        appointment_date,
        appointment_time,
        notes,
        location,
      },
      resolvedAmount,
      resolvedCurrency,
      customerId
    )

    // 2. Asynchronously sync to Google Sheets (non-blocking, failure will not drop booking)
    syncBookingToSheet(booking)
      .then((res) => {
        if (!res.synced) {
          supabaseAdmin
            .from('bookings')
            .update({ google_sheet_sync_status: 'FAILED' })
            .eq('id', booking.id)
            .then(() => {})
        } else {
          supabaseAdmin
            .from('bookings')
            .update({ google_sheet_sync_status: 'SYNCED' })
            .eq('id', booking.id)
            .then(() => {})
        }
      })
      .catch((err) => {
        console.error('Google Sheets sync error:', err)
      })

    // 3. Send email confirmation via Resend (graceful)
    sendBookingReceived(booking).catch((err) => {
      console.error('Email send error:', err)
    })

    // 4. Create in-app notification if customer is registered
    if (customerId) {
      createNotification(
        customerId,
        'Booking Request Received',
        `Your request for appointment on ${appointment_date} at ${appointment_time} is under review.`,
        'BOOKING'
      ).catch(() => {})
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        booking_id: booking.booking_id,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
      },
    })
  } catch (err: any) {
    console.error('Booking creation error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    const emailCookie = req.cookies.get('simran_session_email')?.value

    if (!emailCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (roleCookie === 'ADMIN') {
      const bookings = await getAllBookings()
      return NextResponse.json({ bookings })
    }

    // Customer can only read own bookings
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', emailCookie)
      .maybeSingle()

    if (userProfile) {
      const bookings = await getBookingsByCustomer(userProfile.id)
      return NextResponse.json({ bookings })
    }

    // Fallback search by email
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('*, service:services(*)')
      .eq('email', emailCookie)
      .order('created_at', { ascending: false })

    return NextResponse.json({ bookings: bookings || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch bookings' }, { status: 500 })
  }
}
