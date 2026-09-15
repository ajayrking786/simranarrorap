'use client'

import React, { useState, useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'

export default function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if age gate is verified in this session/browser
    const verified = localStorage.getItem('simran_age_verified')
    const ageGateEnabled = localStorage.getItem('simran_age_gate_active') === 'true'

    // If enabled and not yet verified, show modal
    if (ageGateEnabled && !verified) {
      setIsOpen(true)
    }
  }, [])

  const handleEnter = () => {
    localStorage.setItem('simran_age_verified', 'true')
    setIsOpen(false)
  }

  const handleExit = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="max-w-md w-full bg-[#111111] border border-[#e91e8c]/50 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(233,30,140,0.3)] space-y-6 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#e91e8c]/10 border border-[#e91e8c] flex items-center justify-center text-[#e91e8c] shadow-[0_0_20px_rgba(233,30,140,0.3)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            18+ AGE VERIFICATION
          </h2>
          <p className="text-xs text-[#e91e8c] font-medium uppercase tracking-widest">
            Simran Arrora ♡
          </p>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed">
          Welcome to the official creative platform of Simran Arrora. Some content and media features are intended strictly for mature audiences aged 18 and older.
        </p>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleEnter}
            className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] hover:shadow-[0_0_30px_rgba(233,30,140,0.8)] transition-all"
          >
            I AM 18 OR OLDER — ENTER
          </button>
          <button
            onClick={handleExit}
            className="w-full py-3 px-4 rounded-full border border-white/20 text-gray-400 hover:text-white hover:border-white/40 text-xs font-semibold uppercase tracking-wider transition-all"
          >
            I AM UNDER 18 — EXIT
          </button>
        </div>
      </div>
    </div>
  )
}
