'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Send, CheckCircle2 } from 'lucide-react'

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type: 'INFO' }),
      })
      if (res.ok) {
        setSuccess(true)
        setTitle('')
        setMessage('')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">System &amp; In-App Notifications</h1>
        <p className="text-xs text-gray-400 mt-1">Broadcast in-app notifications and announcements to patrons.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Notification broadcasted successfully!</span>
        </div>
      )}

      <form onSubmit={handleBroadcast} className="glass-panel p-8 rounded-3xl border-white/10 space-y-5 text-xs">
        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Notification Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. New Seasonal Lookbook Released"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-300 font-semibold uppercase">Message Content *</label>
          <textarea
            required
            rows={4}
            placeholder="Write announcement body..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? 'Sending...' : 'Broadcast Notification'}</span>
        </button>
      </form>
    </div>
  )
}
