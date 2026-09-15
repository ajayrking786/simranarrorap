'use client'

import React, { useEffect, useState } from 'react'
import { FileText, Save, CheckCircle2 } from 'lucide-react'
import type { LegalPage } from '@/types'

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[]>([])
  const [selectedSlug, setSelectedSlug] = useState('terms')
  const [currentContent, setCurrentContent] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const loadPages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/legal-pages')
      if (res.ok) {
        const data = await res.json()
        const pageList: LegalPage[] = data.pages || []
        setPages(pageList)
        const match = pageList.find((p) => p.slug === selectedSlug)
        if (match) {
          setCurrentTitle(match.title)
          setCurrentContent(match.content || '')
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug)
    const match = pages.find((p) => p.slug === slug)
    if (match) {
      setCurrentTitle(match.title)
      setCurrentContent(match.content || '')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/legal-pages/${selectedSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          content: currentContent,
          published: true,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        await loadPages()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Legal &amp; Policy Pages</h1>
        <p className="text-xs text-gray-400 mt-1">
          Review and update Terms, Privacy, Shipping, and Cancellation policies.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Page content updated successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {['terms', 'privacy', 'shipping', 'cancellation-refund'].map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => handleSelectPage(slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedSlug === slug
                ? 'bg-[#e91e8c] text-white shadow-[0_0_15px_rgba(233,30,140,0.4)]'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {slug.replace('-', ' & ')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border-white/10 space-y-5 text-xs">
        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Page Title</label>
          <input
            type="text"
            required
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Markdown / Plain Content</label>
          <textarea
            rows={14}
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#e91e8c] resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Legal Content'}</span>
        </button>
      </form>
    </div>
  )
}
