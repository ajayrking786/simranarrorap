'use client'

import React, { useEffect, useState } from 'react'
import { 
  Check, X, Calendar, Clock, AlertCircle, 
  RotateCcw, Trash2, Search, Filter, RefreshCw 
} from 'lucide-react'
import type { Booking, BookingStatus } from '@/types'

export default function AdminAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        await loadBookings()
      } else {
        alert('Failed to update booking status')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.booking_status === filterStatus
    const matchesSearch = 
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Appointments Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Review customer bookings, verify availability, approve or reject requests.
          </p>
        </div>
        <button
          onClick={loadBookings}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, email, or Booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-[#e91e8c] text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="glass-panel rounded-3xl border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Loading appointments...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-xs">
            No appointments found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-6">Booking ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Date &amp; Time</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Payment</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-white">{b.booking_id}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-white">{b.customer_name}</p>
                      <p className="text-[11px] text-gray-500">{b.email}</p>
                      <p className="text-[11px] text-gray-500">{b.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-white">{b.service?.name || 'Creator Service'}</p>
                      {b.location && <p className="text-[10px] text-gray-500">{b.location}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white font-medium">{b.appointment_date}</p>
                      <p className="text-gray-500">{b.appointment_time}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {b.currency} {b.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-white/5 border border-white/10">
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.booking_status === 'APPROVED'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : b.booking_status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : b.booking_status === 'CANCELLED'
                          ? 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.booking_status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(b.id, 'APPROVED')}
                              disabled={actionLoading === b.id}
                              title="Approve Booking"
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(b.id, 'REJECTED')}
                              disabled={actionLoading === b.id}
                              title="Reject Booking"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {b.booking_status === 'APPROVED' && (
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                            disabled={actionLoading === b.id}
                            title="Cancel Booking"
                            className="p-1.5 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-[10px] px-2"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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
