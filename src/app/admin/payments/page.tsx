'use client'

import React, { useEffect, useState } from 'react'
import { CreditCard, RefreshCw, ShieldCheck } from 'lucide-react'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/payments')
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Payment Records &amp; Gateways</h1>
          <p className="text-xs text-gray-400 mt-1">
            Verified Razorpay transaction orders and settlement logs.
          </p>
        </div>
        <button
          onClick={loadPayments}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Loading payment logs...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
            No transaction records found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-6">Payment ID</th>
                  <th className="py-3.5 px-6">Booking Ref</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Gateway Status</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-white">{p.razorpay_payment_id || p.id}</td>
                    <td className="py-4 px-6 font-mono text-gray-400">{p.booking_id}</td>
                    <td className="py-4 px-6 font-bold text-white">
                      {p.currency} {p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(p.created_at).toLocaleString()}
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
