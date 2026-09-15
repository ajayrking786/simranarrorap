'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      if (data.user?.role !== 'ADMIN') {
        throw new Error('Access denied: You do not have administrator credentials.')
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Access denied.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#e91e8c]/15 border border-[#e91e8c] flex items-center justify-center text-[#ff2d9c]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mt-2">
            Admin Portal Access
          </h1>
          <p className="text-xs text-gray-400">
            Authorized administrative personnel only. Scoped credentials enforced.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@simranarrora.com"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Verifying Role...</span>
            ) : (
              <>
                <span>Sign In as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
            &larr; Return to public site
          </Link>
        </div>
      </div>
    </div>
  )
}
