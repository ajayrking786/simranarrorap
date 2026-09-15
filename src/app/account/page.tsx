'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Calendar, CreditCard, Bell, User, 
  LogOut, ArrowRight, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center text-gray-500">
        <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest">Loading account profile...</p>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Profile Header */}
      <div className="glass-panel p-8 rounded-3xl border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e91e8c] to-[#ff2d9c] flex items-center justify-center text-white font-serif text-2xl font-bold shadow-[0_0_20px_rgba(233,30,140,0.5)]">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">
              {user?.full_name || 'Valued Client'}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#e91e8c]/20 text-[#ff2d9c] text-[10px] font-semibold uppercase tracking-wider mt-2">
              Patron Account
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/account/bookings"
          className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#e91e8c]/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e91e8c]/10 border border-[#e91e8c]/30 flex items-center justify-center text-[#ff2d9c]">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#ff2d9c] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[#ff2d9c] transition-colors">
              My Bookings
            </h3>
            <p className="text-xs text-gray-400 mt-1">Review appointment statuses, session dates, and approvals.</p>
          </div>
        </Link>

        <Link
          href="/account/payments"
          className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#e91e8c]/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e91e8c]/10 border border-[#e91e8c]/30 flex items-center justify-center text-[#ff2d9c]">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#ff2d9c] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[#ff2d9c] transition-colors">
              Payment History
            </h3>
            <p className="text-xs text-gray-400 mt-1">Check verified transactions and digital payment receipts.</p>
          </div>
        </Link>

        <Link
          href="/account/notifications"
          className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#e91e8c]/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e91e8c]/10 border border-[#e91e8c]/30 flex items-center justify-center text-[#ff2d9c]">
              <Bell className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#ff2d9c] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[#ff2d9c] transition-colors">
              Notifications
            </h3>
            <p className="text-xs text-gray-400 mt-1">Booking approval updates and priority creator announcements.</p>
          </div>
        </Link>
      </div>

      {/* Booking Quick CTA */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#161616] via-[#1a1218] to-[#161616] border border-[#e91e8c]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Need to schedule a new session?</h3>
          <p className="text-xs text-gray-400 mt-0.5">Explore available commercial campaigns, photography slots, or creator consults.</p>
        </div>
        <Link
          href="/book"
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 transition-all whitespace-nowrap"
        >
          Book An Appointment
        </Link>
      </div>
    </div>
  )
}
