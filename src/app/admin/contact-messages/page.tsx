'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Trash2, Archive, CheckCircle2, MessageSquare } from 'lucide-react'
import type { ContactMessage } from '@/types'

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contact-messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: 'DELETE' })
      if (res.ok) await loadMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleArchive = async (msg: ContactMessage) => {
    try {
      await fetch(`/api/admin/contact-messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !msg.archived }),
      })
      await loadMessages()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Client Inquiries &amp; Messages</h1>
        <p className="text-xs text-gray-400 mt-1">
          Submissions received through the public contact form.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
          No customer inquiries received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`glass-panel p-6 rounded-2xl border-white/10 space-y-3 ${
                m.archived ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{m.name}</span>
                    <span className="font-mono text-xs text-gray-400 font-normal">({m.email})</span>
                  </h3>
                  {m.phone && <p className="text-xs text-gray-500">Phone: {m.phone}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleToggleArchive(m)}
                    className="p-1 text-gray-400 hover:text-white"
                    title={m.archived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {m.subject && (
                <p className="text-xs font-semibold text-[#ff2d9c]">Subject: {m.subject}</p>
              )}

              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#141414] p-3.5 rounded-xl border border-white/5">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
