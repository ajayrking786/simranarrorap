'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, CheckCircle2, Info, Sparkles } from 'lucide-react'
import type { Notification } from '@/types'

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          // Default initial notification
          setNotifications([
            {
              id: 'notif-welcome',
              user_id: '',
              title: 'Welcome to Simran Arrora Community ♡',
              message: 'Thank you for creating an account. You will receive updates here whenever your booking status changes.',
              type: 'INFO',
              read: false,
              created_at: new Date().toISOString(),
            },
          ])
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white">Notifications</h1>
        <p className="text-xs text-gray-400">Important messages, appointment approvals, and status alerts.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl p-8 space-y-3">
          <Bell className="w-12 h-12 mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-white">No New Notifications</h3>
          <p className="text-xs text-gray-400">You are completely caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="glass-card p-6 rounded-2xl border-white/10 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e91e8c]/15 border border-[#e91e8c]/30 flex items-center justify-center text-[#ff2d9c] shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{n.title}</h3>
                  <span className="text-[10px] text-gray-500">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
