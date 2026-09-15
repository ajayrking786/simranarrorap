import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import FeatureCards from '@/components/FeatureCards'
import { Radio, ArrowRight, CheckCircle2, Calendar, Star } from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Cinematic Hero */}
      <Hero />

      {/* 2. Five Feature Cards */}
      <FeatureCards />

      {/* 3. Live Broadcast Status Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
              <Radio className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-600" />
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                  Live Stream Status
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                LIVE IS CURRENTLY OFFLINE
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Check back soon or follow on Telegram &amp; Instagram for scheduled stream announcements.
              </p>
            </div>
          </div>
          <Link
            href="/join"
            className="px-6 py-2.5 rounded-full border border-white/20 hover:border-[#e91e8c] text-xs font-semibold uppercase tracking-wider text-white hover:text-[#ff2d9c] transition-all whitespace-nowrap"
          >
            Get Notified
          </Link>
        </div>
      </section>

      {/* 4. About Teaser Section (Two-column layout, image + text) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Column */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-panel border-white/10 shadow-2xl">
            <Image
              src="https://picsum.photos/seed/simran-about-portrait/800/1000"
              alt="Simran Arrora Creative Portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
              <p className="font-serif text-xl font-bold text-white">Simran Arrora ♡</p>
              <p className="text-xs text-[#e91e8c] tracking-widest uppercase mt-1">
                Visual Artist &amp; Brand Collaborator
              </p>
            </div>
          </div>

          {/* Text Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e91e8c]">
                About The Creator
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Crafting Visual Stories with Intention &amp; Elegance
              </h2>
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Welcome to my digital space. I am a dedicated creative professional specializing in high-concept fashion photography, editorial campaigns, brand partnerships, and community-driven online engagements.
            </p>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Every project is approached with precision, creative authenticity, and respect for client vision. Whether you are seeking brand content creation, photo session collaborations, or exclusive community access, explore our verified booking options.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                <span>Verified Brand Collaborator</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                <span>Professional Studio Sessions</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                <span>Editorial &amp; Runway Content</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                <span>One-on-One Creator Consults</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/about"
                className="px-6 py-3 rounded-full border border-white/20 hover:border-[#e91e8c] text-xs font-bold uppercase tracking-wider text-white hover:text-[#ff2d9c] transition-all inline-flex items-center gap-2"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.4)] hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Session</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Booking Callout Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-[#161616] via-[#1a1218] to-[#161616] border border-[#e91e8c]/30 text-center overflow-hidden shadow-[0_0_50px_rgba(233,30,140,0.15)]">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#e91e8c]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#ff2d9c] font-semibold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-[#e91e8c] text-[#e91e8c]" />
              <span>Direct Professional Reservations</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Ready to Collaborate on Your Next Vision?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Appointments are reviewed and confirmed directly through our verified booking workflow. Browse available session slots and submit your request.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(233,30,140,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Select Date &amp; Service</span>
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-white/5 transition-all"
              >
                Inquire via Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
