'use client'

import React, { useEffect, useState } from 'react'
import { Radio, Save, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminLivePage() {
  const [liveData, setLiveData] = useState({
    title: '',
    description: '',
    public_url: '',
    thumbnail_url: '',
    start_datetime: '',
    end_datetime: '',
    enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadLiveSettings() {
      try {
        const res = await fetch('/api/admin/live')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setLiveData(data.settings)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadLiveSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/live', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liveData),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Live Session Management</h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure real-time stream broadcast alerts, destination links, and schedule timers.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Live settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border-white/10 space-y-6 text-xs">
        {/* Toggle Live Switch */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className={`w-4 h-4 ${liveData.enabled ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
              Broadcast Status
            </h3>
            <p className="text-[11px] text-gray-400">
              {liveData.enabled ? 'Currently LIVE NOW on public banner' : 'Currently OFFLINE on public site'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLiveData({ ...liveData, enabled: !liveData.enabled })}
            className={`px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all ${
              liveData.enabled
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {liveData.enabled ? 'Disable Live' : 'Go Live Now'}
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Live Session Title</label>
          <input
            type="text"
            placeholder="e.g. Exclusive Weekend Q&A & Styling Chat"
            value={liveData.title || ''}
            onChange={(e) => setLiveData({ ...liveData, title: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Public Stream / Join URL</label>
          <input
            type="url"
            placeholder="https://youtube.com/live/... or https://t.me/..."
            value={liveData.public_url || ''}
            onChange={(e) => setLiveData({ ...liveData, public_url: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Session Description</label>
          <textarea
            rows={3}
            placeholder="Brief overview of the upcoming session..."
            value={liveData.description || ''}
            onChange={(e) => setLiveData({ ...liveData, description: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Live Configuration'}</span>
        </button>
      </form>
    </div>
  )
}
