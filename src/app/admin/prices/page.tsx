'use client'

import React, { useEffect, useState } from 'react'
import { Tag, Plus, Trash2 } from 'lucide-react'
import type { PriceOption, Service } from '@/types'

export default function AdminPricesPage() {
  const [prices, setPrices] = useState<PriceOption[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/admin/prices'),
        fetch('/api/admin/services'),
      ])
      if (pRes.ok) {
        const pData = await pRes.json()
        setPrices(pData.prices || [])
      }
      if (sRes.ok) {
        const sData = await sRes.json()
        setServices(sData.services || [])
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

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Price Tiers &amp; Packages</h1>
          <p className="text-xs text-gray-400 mt-1">
            Database-backed price options. All prices are calculated securely server-side.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading pricing tiers...</p>
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
          No custom price tiers created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prices.map((p) => (
            <div key={p.id} className="glass-panel p-6 rounded-2xl border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase font-mono">Tier</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.enabled ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-white/5'
                }`}>
                  {p.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-bold text-white text-base">{p.name}</h3>
              <p className="font-serif text-2xl font-bold text-[#ff2d9c]">
                {p.currency} {p.amount?.toLocaleString('en-IN')}
              </p>
              {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
