import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats } from '@/services/bookingService'

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get('simran_session_role')?.value
    if (roleCookie !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const stats = await getDashboardStats()
    return NextResponse.json({ stats })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
