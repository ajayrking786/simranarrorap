import { NextRequest, NextResponse } from 'next/server'
import { getBookingByBookingId } from '@/services/bookingService'
import { retryFailedSync } from '@/services/sheetsService'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const booking = await getBookingByBookingId(bookingId)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const result = await retryFailedSync(booking.booking_id, booking)

    if (result.synced) {
      await supabaseAdmin
        .from('bookings')
        .update({ google_sheet_sync_status: 'SYNCED' })
        .eq('id', booking.id)

      return NextResponse.json({ synced: true })
    } else {
      return NextResponse.json({ synced: false, error: result.error || 'Failed to sync with Google Sheets' }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error retrying sync' }, { status: 500 })
  }
}
