import { NextRequest, NextResponse } from 'next/server'
import { updateBookingStatus, getBookingById } from '@/services/bookingService'
import { updateBookingRowInSheet } from '@/services/sheetsService'
import { sendBookingApproved, sendBookingRejected, sendBookingCancelled } from '@/services/emailService'
import type { BookingStatus } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { status } = await req.json()
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const updated = await updateBookingStatus(id, status as BookingStatus)

    // Sync status change to Google Sheet
    updateBookingRowInSheet(updated.booking_id, status as BookingStatus).catch((err) => {
      console.warn('Sheets update error:', err)
    })

    // Send corresponding transactional email
    if (status === 'APPROVED') {
      sendBookingApproved(updated).catch(() => {})
    } else if (status === 'REJECTED') {
      sendBookingRejected(updated).catch(() => {})
    } else if (status === 'CANCELLED') {
      sendBookingCancelled(updated).catch(() => {})
    }

    return NextResponse.json({ booking: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update booking status' }, { status: 500 })
  }
}
