'use client'

import React, { useState } from 'react'
import { Settings2, Save, CheckCircle2 } from 'lucide-react'

export default function AdminBookingConfigPage() {
  const [advanceDays, setAdvanceDays] = useState(14)
  const [bufferTime, setBufferTime] = useState(30)
  const [autoEmail, setAutoEmail] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Booking Calendar Configuration</h1>
        <p className="text-xs text-gray-400 mt-1">
          Adjust appointment lead times, slot intervals, and review triggers.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Booking configuration saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border-white/10 space-y-6 text-xs">
        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Booking Horizon (Days into Future)</label>
          <input
            type="number"
            value={advanceDays}
            onChange={(e) => setAdvanceDays(Number(e.target.value))}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
          <p className="text-[11px] text-gray-500">How many days in advance customers can select dates.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Buffer Time Between Sessions (Minutes)</label>
          <input
            type="number"
            value={bufferTime}
            onChange={(e) => setBufferTime(Number(e.target.value))}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white">Automatic Email Confirmations</h3>
            <p className="text-[11px] text-gray-400">Trigger transactional emails via Resend when configured.</p>
          </div>
          <button
            type="button"
            onClick={() => setAutoEmail(!autoEmail)}
            className={`px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all ${
              autoEmail
                ? 'bg-[#e91e8c] text-white'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {autoEmail ? 'Active' : 'Disabled'}
          </button>
        </div>

        <button
          type="submit"
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </form>
    </div>
  )
}
