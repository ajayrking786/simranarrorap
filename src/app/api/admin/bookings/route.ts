import { NextRequest, NextResponse } from 'next/server'
import { getAllBookings } from '@/services/bookingService'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const date = searchParams.get('date') || undefined

    const bookings = await getAllBookings({ status, date })
    return NextResponse.json({ bookings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch bookings' }, { status: 500 })
  }
}
