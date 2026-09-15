'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react'

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch('/api/bookings')
        if (res.ok) {
          const data = await res.json()
          // Derive payments from customer bookings
          const bookingList = data.bookings || []
          setPayments(
            bookingList.map((b: any) => ({
              id: b.id,
              booking_id: b.booking_id,
              service_name: b.service?.name || 'Creator Collaboration',
              amount: b.amount,
              currency: b.currency,
              payment_status: b.payment_status,
              created_at: b.created_at,
            }))
          )
        }
      } catch (err) {
        console.error('Failed to load customer payments:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [])

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white">Payment Records</h1>
        <p className="text-xs text-gray-400">Verified transaction receipts and reservation fee details.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading payment records...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl p-8 space-y-3">
          <CreditCard className="w-12 h-12 mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-white">No Payments Recorded</h3>
          <p className="text-xs text-gray-400">Payment receipts will appear here once an appointment is reserved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="glass-card p-6 rounded-2xl border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400 font-semibold">{p.booking_id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                    p.payment_status === 'APPROVED'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {p.payment_status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{p.service_name}</h3>
                <p className="text-[11px] text-gray-500">
                  Processed via Razorpay • Verified Gateway
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                <p className="font-serif text-xl font-bold text-[#ff2d9c]">
                  {p.currency} {p.amount?.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  {new Date(p.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
