'use client'

import React, { useEffect, useState } from 'react'
import { Users, Mail, Phone, Calendar, RefreshCw } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Registered Patrons &amp; Clients</h1>
          <p className="text-xs text-gray-400 mt-1">Verified user records with customer role scope.</p>
        </div>
        <button
          onClick={loadCustomers}
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
            <p className="text-xs">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-xs">
            No patrons or customers registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">
                      {c.full_name || 'Anonymous Patron'}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-400">{c.email}</td>
                    <td className="py-4 px-6">{c.phone || '—'}</td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
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
