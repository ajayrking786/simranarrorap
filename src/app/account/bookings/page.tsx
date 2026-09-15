'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react'
import type { Booking } from '@/types'

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings')
        if (res.ok) {
          const data = await res.json()
          setBookings(data.bookings || [])
        }
      } catch (err) {
        console.error('Failed to load customer bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-semibold">Confirmed</span>
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-xs font-semibold">Under Review</span>
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-semibold">Unavailable</span>
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-500/10 border border-gray-500/40 text-gray-400 text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white">My Bookings</h1>
          <p className="text-xs text-gray-400">All appointment requests submitted under your customer account.</p>
        </div>
        <Link
          href="/book"
          className="px-5 py-2 rounded-full bg-[#e91e8c] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#ff2d9c] transition-all"
        >
          New Booking
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl p-8 space-y-4">
          <Calendar className="w-12 h-12 mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You have not submitted any booking requests yet. Browse our services to reserve your first appointment.
          </p>
          <Link
            href="/book"
            className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="glass-card p-6 rounded-2xl border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#ff2d9c] font-semibold">{b.booking_id}</span>
                  {getStatusBadge(b.booking_status)}
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {b.service?.name || 'Creator Appointment'}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#e91e8c]" />
                    {b.appointment_date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#e91e8c]" />
                    {b.appointment_time}
                  </span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                <span className="text-[10px] uppercase tracking-wider text-gray-500">Amount</span>
                <p className="font-serif text-lg font-bold text-white">
                  {b.currency} {b.amount?.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Payment: <strong className="text-gray-300">{b.payment_status}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
