'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, ChevronDown, Sparkles } from 'lucide-react'

interface HeroProps {
  heroImage?: string
}

export default function Hero({ heroImage }: HeroProps) {
  // Use elegant placeholder or configured asset
  const imageSrc = heroImage || 'https://picsum.photos/seed/simran-hero-cinematic/1920/1080'

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background Image with Cinematic Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt="Simran Arrora Hero Presentation"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradients to blend into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e91e8c]/15 via-transparent to-transparent" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 flex flex-col items-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e91e8c]/40 bg-[#e91e8c]/10 text-[#ff2d9c] text-xs font-semibold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(233,30,140,0.2)] animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WELCOME TO MY WORLD</span>
        </div>

        {/* Brand Main Title */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-4 leading-none text-glow">
          Simran Arrora <span className="text-[#e91e8c] font-sans inline-block animate-pulse">♡</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg uppercase tracking-[0.25em] text-gray-300 font-medium mb-6">
          Creator <span className="text-[#e91e8c] mx-2">•</span> Collaborator <span className="text-[#e91e8c] mx-2">•</span> Professional
        </p>

        {/* Short Intro */}
        <p className="max-w-2xl text-gray-400 text-sm sm:text-base leading-relaxed mb-10">
          Step into a curated realm of visual artistry, creative direction, professional brand collaborations, and exclusive event appearances.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/gallery"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(233,30,140,0.5)] hover:shadow-[0_0_40px_rgba(233,30,140,0.8)] hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>EXPLORE NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/book"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:border-[#e91e8c] hover:text-[#ff2d9c] transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#e91e8c]" />
            <span>BOOK AN APPOINTMENT</span>
          </Link>
        </div>

        {/* Decorative Indicator */}
        <div className="mt-16 flex flex-col items-center text-gray-500 text-xs tracking-widest uppercase gap-2">
          <span className="text-gray-400">Stay Connected ♡</span>
          <div className="flex items-center gap-1 mt-2 text-gray-500 animate-bounce">
            <span className="text-[10px]">Scroll Down</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#e91e8c]" />
          </div>
        </div>
      </div>
    </section>
  )
}
