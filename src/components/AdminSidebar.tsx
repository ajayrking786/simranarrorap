'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Users, Briefcase, Tag, Settings2,
  Image as ImageIcon, Video, Share2, Radio, CreditCard,
  FileSpreadsheet, Bell, MessageSquare, FileText, Globe, Sliders, LogOut
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Services', href: '/admin/services', icon: Briefcase },
  { label: 'Prices', href: '/admin/prices', icon: Tag },
  { label: 'Booking Config', href: '/admin/booking-config', icon: Settings2 },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { label: 'Videos', href: '/admin/videos', icon: Video },
  { label: 'Social Links', href: '/admin/social-links', icon: Share2 },
  { label: 'Live Management', href: '/admin/live', icon: Radio },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Google Sheets', href: '/admin/google-sheets', icon: FileSpreadsheet },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Contact Messages', href: '/admin/contact-messages', icon: MessageSquare },
  { label: 'Legal Pages', href: '/admin/legal-pages', icon: FileText },
  { label: 'SEO Settings', href: '/admin/seo', icon: Globe },
  { label: 'Settings', href: '/admin/settings', icon: Sliders },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-[#0e0e0e] border-r border-white/10 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-6 space-y-6">
        {/* Brand Header */}
        <Link href="/admin" className="flex items-center gap-1.5 focus:outline-none">
          <span className="font-serif text-lg font-bold text-white tracking-tight">
            Simran Arrora
          </span>
          <span className="text-[#e91e8c] font-sans text-base">♡</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-[#e91e8c]/20 text-[#ff2d9c] text-[9px] font-bold uppercase tracking-wider">
            ADMIN
          </span>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white shadow-[0_0_15px_rgba(233,30,140,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span>View Public Site &rarr;</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
