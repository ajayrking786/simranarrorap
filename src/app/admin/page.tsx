'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, 
  XCircle, CreditCard, Users, ArrowUpRight, RefreshCw 
} from 'lucide-react'
import type { DashboardStats, Booking } from '@/types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0,
    upcoming: 0,
    paymentPending: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/bookings?limit=5'),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json()
        setRecentBookings(bData.bookings || [])
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const statCards = [
    { title: 'Total Bookings', value: stats.total, icon: Calendar, color: 'text-white' },
    { title: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
    { title: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-400' },
    { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400' },
    { title: "Today's Appointments", value: stats.today, icon: Calendar, color: 'text-[#ff2d9c]' },
    { title: 'Upcoming Sessions', value: stats.upcoming, icon: Users, color: 'text-blue-400' },
    { title: 'Payment Pending', value: stats.paymentPending, icon: CreditCard, color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time statistics derived directly from verified database records.</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.title} className="glass-panel p-5 rounded-2xl border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {c.title}
                </span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className={`font-serif text-3xl font-bold ${c.color}`}>
                {loading ? '—' : c.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent Appointments Section */}
      <div className="glass-panel rounded-3xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">Recent Appointments</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest customer booking requests.</p>
          </div>
          <Link
            href="/admin/appointments"
            className="text-xs text-[#ff2d9c] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            No booking requests recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-6">Booking ID</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Service</th>
                  <th className="py-3 px-6">Date &amp; Time</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-white">{b.booking_id}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-white">{b.customer_name}</p>
                      <p className="text-[11px] text-gray-500">{b.email}</p>
                    </td>
                    <td className="py-4 px-6">{b.service?.name || 'Creator Service'}</td>
                    <td className="py-4 px-6">
                      {b.appointment_date} at {b.appointment_time}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {b.currency} {b.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.booking_status === 'APPROVED'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : b.booking_status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
