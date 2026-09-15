'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Image as ImageIcon, Video, Users, Share2, Sparkles, ArrowRight } from 'lucide-react'

const features = [
  {
    title: 'Photo Gallery',
    description: 'Explore high-fashion editorial portraits, creative lookbooks, and behind-the-scenes photography.',
    href: '/gallery',
    icon: ImageIcon,
    image: 'https://picsum.photos/seed/simran-gallery-card/600/400',
    cta: 'View Gallery',
  },
  {
    title: 'Video Collection',
    description: 'Watch cinematic reels, lifestyle captures, professional highlights, and creative vlogs.',
    href: '/videos',
    icon: Video,
    image: 'https://picsum.photos/seed/simran-video-card/600/400',
    cta: 'Watch Videos',
  },
  {
    title: 'Join Community',
    description: 'Access exclusive community announcements, private event invites, and early booking updates.',
    href: '/join',
    icon: Users,
    image: 'https://picsum.photos/seed/simran-join-card/600/400',
    cta: 'Join Now',
  },
  {
    title: 'Connect With Me',
    description: 'Follow on Instagram, YouTube, X, and Telegram to stay closely aligned with latest news.',
    href: '/contact',
    icon: Share2,
    image: 'https://picsum.photos/seed/simran-connect-card/600/400',
    cta: 'Get in Touch',
  },
  {
    title: 'Professional Services',
    description: 'Book verified brand collaborations, commercial sessions, event appearances, and consultations.',
    href: '/book',
    icon: Sparkles,
    image: 'https://picsum.photos/seed/simran-premium-card/600/400',
    cta: 'Book Services',
  },
]

export default function FeatureCards() {
  return (
    <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14 space-y-2">
        <h2 className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Featured Modules
        </h2>
        <p className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Explore The Experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon
          const isSpanTwo = idx === 3 // Layout balance for 5 cards

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group glass-card rounded-2xl overflow-hidden relative flex flex-col justify-between ${
                isSpanTwo ? 'lg:col-span-1' : ''
              }`}
            >
              {/* Card Image Cover */}
              <div className="relative w-full h-52 overflow-hidden bg-[#161616]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/40 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#ff2d9c] shadow-md group-hover:border-[#e91e8c] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#ff2d9c] transition-colors flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e91e8c] group-hover:text-white transition-colors">
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
