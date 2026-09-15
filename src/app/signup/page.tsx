'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      router.push('/account')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
            <span className="font-serif text-2xl font-bold text-white">Simran Arrora</span>
            <span className="text-[#e91e8c] text-xl">♡</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-white mt-2">Join as Patron / Client</h1>
          <p className="text-xs text-gray-400">Create an account to track session reservations and requests</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Maya Verma"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya@example.com"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/10">
          Already have an account?{' '}
          <Link href="/login" className="text-[#ff2d9c] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
