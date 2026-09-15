'use client'

import React, { useState } from 'react'
import { Globe, Save, CheckCircle2 } from 'lucide-react'

export default function AdminSeoPage() {
  const [metaTitle, setMetaTitle] = useState('Simran Arrora ♡ | Creator • Collaborator • Professional')
  const [metaDesc, setMetaDesc] = useState('Official creative platform of Simran Arrora — visual portfolios, cinematic showcases, and professional booking.')
  const [keywords, setKeywords] = useState('Simran Arrora, Fashion Creator, Collaborator, Photo Gallery, Professional Bookings')
  const [canonicalDomain, setCanonicalDomain] = useState('https://simranarrora.com')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Search Engine Optimization (SEO)</h1>
        <p className="text-xs text-gray-400 mt-1">Configure global meta tags, OpenGraph previews, and indexing policies.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>SEO settings updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border-white/10 space-y-5 text-xs">
        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Global Meta Title</label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Global Meta Description</label>
          <textarea
            rows={3}
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Meta Keywords (Comma separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Canonical Domain</label>
          <input
            type="url"
            value={canonicalDomain}
            onChange={(e) => setCanonicalDomain(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 text-gray-400">
          <p className="font-semibold text-white">Robots Indexing Rules</p>
          <p className="text-[11px]">Public pages: <code className="text-[#ff2d9c]">index, follow</code></p>
          <p className="text-[11px]">Admin routes: <code className="text-[#ff2d9c]">noindex, nofollow</code></p>
        </div>

        <button
          type="submit"
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save SEO Preferences</span>
        </button>
      </form>
    </div>
  )
}
