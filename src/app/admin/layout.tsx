'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // If on admin login page, don't show admin sidebar
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#0a0a0a] text-white">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  )
}
