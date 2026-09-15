'use client'

import React, { useEffect, useState } from 'react'
import { FileSpreadsheet, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import type { Booking } from '@/types'

export default function AdminGoogleSheetsPage() {
  const [failedBookings, setFailedBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.ok) {
        const data = await res.json()
        const all: Booking[] = data.bookings || []
        setFailedBookings(all.filter((b) => b.google_sheet_sync_status === 'FAILED'))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRetry = async (bookingId: string) => {
    setRetryingId(bookingId)
    setMessage(null)
    try {
      const res = await fetch('/api/google-sheets/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (res.ok && data.synced) {
        setMessage(`Booking ${bookingId} synced to Google Sheets successfully!`)
        await loadData()
      } else {
        setMessage(`Sync failed: ${data.error || 'Check Google Service Account credentials'}`)
      }
    } catch {
      setMessage('Network error retrying sync.')
    } finally {
      setRetryingId(null)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Google Sheets Reporting Sync</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time synchronization of bookings to Google Sheets reporting tab.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-white/5 border border-[#e91e8c]/30 text-xs text-white">
          {message}
        </div>
      )}

      {/* Sync Architecture Status Box */}
      <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Reporting Tab: `Bookings`</h3>
            <p className="text-xs text-gray-400">
              Columns: Booking ID, Created At, Customer Name, Email, Phone, Service, Date, Time, Location, Duration, Amount, Currency, Payment Status, Booking Status, Notes.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-gray-500 border-t border-white/10 pt-3">
          Note: In accordance with our resilient design, if Google Sheets write fails or is unconfigured, the primary booking in Supabase is never lost. Failed syncs can be retried below.
        </div>
      </div>

      {/* Failed Syncs Table */}
      <div className="glass-panel rounded-2xl border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Pending / Failed Sheet Syncs</h3>
          <span className="text-xs text-gray-500">{failedBookings.length} pending retry</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-xs">Checking records...</div>
        ) : failedBookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-green-500/50" />
            <span>All current bookings are either synchronized or freshly queued.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10 uppercase">
                <tr>
                  <th className="py-3 px-6">Booking ID</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Service</th>
                  <th className="py-3 px-6">Sync Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {failedBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3.5 px-6 font-mono text-white">{b.booking_id}</td>
                    <td className="py-3.5 px-6">{b.customer_name}</td>
                    <td className="py-3.5 px-6">{b.service?.name || 'Creator Service'}</td>
                    <td className="py-3.5 px-6">
                      <span className="text-red-400 font-semibold uppercase">{b.google_sheet_sync_status}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleRetry(b.booking_id)}
                        disabled={retryingId === b.booking_id}
                        className="px-3 py-1.5 rounded-lg bg-[#e91e8c] text-white font-semibold hover:bg-[#ff2d9c] disabled:opacity-50"
                      >
                        {retryingId === b.booking_id ? 'Retrying...' : 'Retry Sync'}
                      </button>
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
