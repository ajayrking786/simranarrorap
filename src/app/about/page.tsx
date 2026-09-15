import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Heart, Sparkles, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'About Me | Simran Arrora ♡',
  description: 'Learn more about Simran Arrora — professional creator, visual collaborator, and editorial artist.',
}

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Biography &amp; Vision
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          About Simran Arrora <span className="text-[#e91e8c]">♡</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Creator • Collaborator • Professional. Bringing creative direction, styling, and visual nuance to lifestyle and commercial narratives.
        </p>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Portrait presentation */}
        <div className="space-y-6">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-panel border-white/10 shadow-2xl">
            <Image
              src="https://picsum.photos/seed/simran-about-main/900/1200"
              alt="Simran Arrora Editorial Portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-50" />
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div>
                <p className="font-serif text-xl font-bold text-white">Simran Arrora ♡</p>
                <p className="text-xs text-gray-400 tracking-wider">Independent Visual Artist</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e91e8c]/20 border border-[#e91e8c] flex items-center justify-center text-[#ff2d9c]">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Narrative Details */}
        <div className="space-y-8 text-gray-300">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              The Journey &amp; Creative Ethos
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-300">
              My work centers around modern fashion aesthetics, authentic visual storytelling, and thoughtful creative direction. Working across portraiture, high-definition video, and live digital sessions, I strive to create memorable experiences that celebrate individuality, style, and contemporary art.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-gray-400">
              I believe in direct, transparent collaboration. When working with brands, photographers, or community patrons, every engagement is tailored with dedicated scheduling, clear agreements, and professional standards.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#e91e8c]">
              Core Professional Focus Areas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                  <span>Fashion Campaigns</span>
                </div>
                <p className="text-xs text-gray-400">Commercial apparel, jewelry showcases, and high-fashion editorial direction.</p>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                  <span>Visual Content Creation</span>
                </div>
                <p className="text-xs text-gray-400">Cinematic video shorts, digital lookbooks, and platform-native media assets.</p>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                  <span>Creator Consultations</span>
                </div>
                <p className="text-xs text-gray-400">One-on-one strategy sessions on branding, visual curation, and digital presence.</p>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                  <span>Event Appearances</span>
                </div>
                <p className="text-xs text-gray-400">Exclusive creator showcases, brand activations, and verified event hospitality.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/book"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(233,30,140,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book an Appointment</span>
            </Link>
            <Link
              href="/gallery"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 hover:border-[#e91e8c] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all text-center"
            >
              Explore Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
