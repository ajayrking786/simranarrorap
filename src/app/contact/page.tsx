'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please try again later.')
    }
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          Contact Simran <span className="text-[#e91e8c]">♡</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          For brand partnership inquiries, editorial bookings, press, or questions, please send a message. We typically respond within 24 to 48 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info Column */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/10 space-y-6">
            <h3 className="font-serif text-xl font-bold text-white">Direct Channels</h3>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#e91e8c]/10 border border-[#e91e8c]/30 flex items-center justify-center text-[#ff2d9c] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                  <p className="text-white font-medium">collaborate@simranarrora.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#e91e8c]/10 border border-[#e91e8c]/30 flex items-center justify-center text-[#ff2d9c] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Location Base</p>
                  <p className="text-white font-medium">Mumbai / New Delhi, India</p>
                  <p className="text-xs text-gray-500">Available for worldwide travel</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e91e8c]">
                Professional Inquiries
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                For commercial contracts, verified agency requests, or custom event appearances, please mention full campaign details and expected timelines.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 sm:p-10 rounded-2xl border-white/10">
            {status === 'success' ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Thank You!</h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                  Your message has been received successfully. We will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-6 py-2.5 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider text-white hover:border-[#e91e8c]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                      Your Name <span className="text-[#e91e8c]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maya Verma"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                      Email Address <span className="text-[#e91e8c]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="maya@example.com"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                      Subject <span className="text-[#e91e8c]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brand Collaboration / Commercial Inquiry"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                    Message Details <span className="text-[#e91e8c]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your project, timeline, and collaboration goals..."
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e8c] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
