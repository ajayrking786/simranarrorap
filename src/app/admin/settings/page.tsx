'use client'

import React, { useEffect, useState } from 'react'
import { Sliders, Save, CheckCircle2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('Simran Arrora ♡')
  const [ageGateEnabled, setAgeGateEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setSiteName(data.settings.site_name || 'Simran Arrora ♡')
            setAgeGateEnabled(data.settings.age_gate_enabled === 'true')
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_name: siteName,
          age_gate_enabled: ageGateEnabled ? 'true' : 'false',
        }),
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
        <h1 className="font-serif text-3xl font-bold text-white">System &amp; Site Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Global platform configuration and security controls.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border-white/10 space-y-6 text-xs">
        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Brand / Site Name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        {/* Age gate toggle */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white">18+ Age Gate Verification</h3>
            <p className="text-[11px] text-gray-400">
              When enabled, visitors will see the branded 18+ Age Verification modal upon entry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAgeGateEnabled(!ageGateEnabled)}
            className={`px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all ${
              ageGateEnabled
                ? 'bg-[#e91e8c] text-white shadow-[0_0_15px_rgba(233,30,140,0.5)]'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {ageGateEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
        </button>
      </form>
    </div>
  )
}
