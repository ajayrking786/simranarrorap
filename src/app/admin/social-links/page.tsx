'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Share2, Save, CheckCircle2 } from 'lucide-react'
import type { SocialLink } from '@/types'

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const loadLinks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/social-links')
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLinks()
  }, [])

  const handleUpdateField = (index: number, field: string, value: any) => {
    const updated = [...links]
    updated[index] = { ...updated[index], [field]: value }
    setLinks(updated)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
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
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Social Channel Links</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure verified external social destinations shown in header and footer.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(233,30,140,0.4)] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Links'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Social links updated successfully!</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading social links...</p>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
          No social links configured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link, idx) => (
            <div
              key={link.id || idx}
              className="glass-panel p-5 rounded-2xl border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="w-40 font-bold text-white text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#ff2d9c]" />
                <span>{link.name}</span>
              </div>

              <div className="flex-1">
                <input
                  type="url"
                  placeholder={`https://${link.platform || 'social'}.com/...`}
                  value={link.url || ''}
                  onChange={(e) => handleUpdateField(idx, 'url', e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateField(idx, 'enabled', !link.enabled)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    link.enabled
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}
                >
                  {link.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
