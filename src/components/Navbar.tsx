'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, X, Instagram, Twitter, Send, 
  MessageCircle, Youtube, Calendar, Heart 
} from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Me', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Videos', href: '/videos' },
  { label: 'Join', href: '/join' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname?.startsWith('/admin')) {
    return null // Admin has its own layout
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/10 shadow-2xl py-3' 
          : 'bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-1.5 focus:outline-none">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-pink-400 transition-colors">
            Simran Arrora
          </span>
          <span className="text-[#e91e8c] text-lg sm:text-xl transform group-hover:scale-125 transition-transform inline-block">
            ♡
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wider uppercase transition-colors relative py-1 ${
                  isActive 
                    ? 'text-[#e91e8c] font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e91e8c] shadow-[0_0_8px_#e91e8c]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Socials + CTAs */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-3 border-r border-white/10 pr-5 text-gray-400">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram" 
              className="hover:text-[#e91e8c] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="X" 
              className="hover:text-[#e91e8c] transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Telegram" 
              className="hover:text-[#e91e8c] transition-colors"
            >
              <Send className="w-4 h-4" />
            </a>
            <a 
              href="https://reddit.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Reddit" 
              className="hover:text-[#e91e8c] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="YouTube" 
              className="hover:text-[#e91e8c] transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/join"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white border border-[#e91e8c]/50 rounded-full hover:bg-[#e91e8c]/20 hover:border-[#e91e8c] transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#e91e8c]" />
              Follow Me
            </Link>
            <Link
              href="/book"
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] rounded-full shadow-[0_0_15px_rgba(233,30,140,0.5)] hover:shadow-[0_0_25px_rgba(233,30,140,0.8)] hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Now
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-6 h-6 text-[#e91e8c]" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base tracking-wider uppercase py-2 transition-colors ${
                    isActive ? 'text-[#e91e8c] font-semibold pl-2 border-l-2 border-[#e91e8c]' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 flex items-center justify-around text-gray-400 py-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="w-5 h-5 hover:text-[#e91e8c]" /></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X"><Twitter className="w-5 h-5 hover:text-[#e91e8c]" /></a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><Send className="w-5 h-5 hover:text-[#e91e8c]" /></a>
            <a href="https://reddit.com" target="_blank" rel="noopener noreferrer" aria-label="Reddit"><MessageCircle className="w-5 h-5 hover:text-[#e91e8c]" /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube className="w-5 h-5 hover:text-[#e91e8c]" /></a>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/join"
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-white border border-[#e91e8c] rounded-full hover:bg-[#e91e8c]/20"
            >
              Follow Me
            </Link>
            <Link
              href="/book"
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] rounded-full shadow-[0_0_15px_rgba(233,30,140,0.4)]"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
