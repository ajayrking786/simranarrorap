'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
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
        throw new Error(data.error || 'Invalid email or password')
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/account')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border-white/10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
            <span className="font-serif text-2xl font-bold text-white">Simran Arrora</span>
            <span className="text-[#e91e8c] text-xl">♡</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-white mt-2">Welcome Back</h1>
          <p className="text-xs text-gray-400">Sign in to review your bookings, sessions, and payments</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/10 flex justify-between">
          <Link href="/signup" className="hover:text-[#ff2d9c] transition-colors">
            Create an account
          </Link>
          <Link href="/admin/login" className="text-gray-500 hover:text-gray-300 transition-colors">
            Admin login &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
