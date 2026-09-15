'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Twitter, Send, MessageCircle, Youtube, Heart } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 text-gray-400 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft pink ambient glow in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#e91e8c]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              Simran Arrora
            </span>
            <span className="text-[#e91e8c] text-xl">♡</span>
          </Link>
          <p className="text-sm text-gray-400 max-w-md leading-relaxed">
            Creator • Collaborator • Professional. Dedicated to creative direction, artistic content collaborations, and premier visual media experiences.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#e91e8c] hover:text-white transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#e91e8c] hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#e91e8c] hover:text-white transition-all">
              <Send className="w-4 h-4" />
            </a>
            <a href="https://reddit.com" target="_blank" rel="noopener noreferrer" aria-label="Reddit" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#e91e8c] hover:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#e91e8c] hover:text-white transition-all">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Me</Link></li>
            <li><Link href="/gallery" className="hover:text-white transition-colors">Visual Gallery</Link></li>
            <li><Link href="/videos" className="hover:text-white transition-colors">Video Collection</Link></li>
            <li><Link href="/join" className="hover:text-white transition-colors">Join Community</Link></li>
            <li><Link href="/book" className="hover:text-[#e91e8c] transition-colors font-medium">Book Appointment</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white">Legal &amp; Policies</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping &amp; Delivery</Link></li>
            <li><Link href="/cancellation-refund" className="hover:text-white transition-colors">Cancellation &amp; Refund</Link></li>
            <li><Link href="/login" className="hover:text-[#e91e8c] transition-colors">Customer Portal</Link></li>
            <li><Link href="/admin/login" className="text-gray-600 hover:text-gray-400 text-xs">Admin Access</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>&copy; {new Date().getFullYear()} Simran Arrora. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-[#e91e8c] fill-[#e91e8c]" /> for an editorial creator experience.
        </p>
      </div>
    </footer>
  )
}
