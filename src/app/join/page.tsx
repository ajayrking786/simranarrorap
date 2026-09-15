import React from 'react'
import Link from 'next/link'
import { 
  Instagram, Twitter, Send, MessageCircle, Youtube, 
  Sparkles, Calendar, CheckCircle2, ArrowRight, ShieldCheck 
} from 'lucide-react'

export const metadata = {
  title: 'Join & Follow | Simran Arrora ♡',
  description: 'Join the Simran Arrora community and connect across official social channels.',
}

const socialPlatforms = [
  {
    name: 'Instagram',
    handle: '@simranarrora',
    desc: 'Daily aesthetic stories, creative reels, and lifestyle photography updates.',
    icon: Instagram,
    url: 'https://instagram.com',
    color: '#E1306C',
  },
  {
    name: 'YouTube',
    handle: 'Simran Arrora Official',
    desc: 'High-definition cinematic vlogs, creative styling diaries, and project films.',
    icon: Youtube,
    url: 'https://youtube.com',
    color: '#FF0000',
  },
  {
    name: 'Telegram Community',
    handle: 't.me/simranarrora',
    desc: 'Direct announcements, scheduled live session links, and priority notifications.',
    icon: Send,
    url: 'https://t.me',
    color: '#0088cc',
  },
  {
    name: 'X (Twitter)',
    handle: '@simranarrora',
    desc: 'Thoughts, announcements, industry conversations, and real-time updates.',
    icon: Twitter,
    url: 'https://x.com',
    color: '#1DA1F2',
  },
  {
    name: 'Reddit Community',
    handle: 'r/simranarrora',
    desc: 'Patron discussions, photo appreciation, and collaborative fan community.',
    icon: MessageCircle,
    url: 'https://reddit.com',
    color: '#FF4500',
  },
]

const servicesList = [
  { title: 'Brand Collaboration', desc: 'Custom commercial campaigns, sponsored reels, and creative storytelling.' },
  { title: 'Content Creation', desc: 'Studio & location-based high-res visual assets and lifestyle showcases.' },
  { title: 'Photography Session', desc: 'Editorial lookbooks, styling sessions, and fashion portfolio photography.' },
  { title: 'Creator Consultation', desc: 'Strategic 1-on-1 virtual sessions on digital curation and personal branding.' },
  { title: 'Online Professional Session', desc: 'Interactive digital discussions, Q&A sessions, and creative workshops.' },
  { title: 'Event Appearance', desc: 'Verified guest appearances at fashion showcases, brand launches, and panels.' },
  { title: 'Community & Event Access', desc: 'Access to private creator gatherings, masterclasses, and curated meets.' },
]

export default function JoinPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Community &amp; Connect
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          Join My Inner Circle <span className="text-[#e91e8c]">♡</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Stay connected through our official platforms for immediate announcements, exclusive content drops, and verified booking opportunities.
        </p>
      </div>

      {/* Official Social Channels */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#e91e8c]">
            Official Platforms
          </h2>
          <p className="font-serif text-2xl font-bold text-white mt-1">Connect Directly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialPlatforms.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#e91e8c]/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#e91e8c] group-hover:scale-110 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{item.handle}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#ff2d9c] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#e91e8c] group-hover:text-white uppercase tracking-wider">
                  <span>Follow on {item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Professional Scope / Services Section */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border-white/10 space-y-10 relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e91e8c] font-semibold">
            Lawful Creator Services Only
          </span>
          <h2 className="font-serif text-3xl font-bold text-white">
            Available Collaborations
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            All appointments are conducted under professional agreements. Strictly out of scope: any unlawful, escort, or prohibited service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesList.map((svc) => (
            <div key={svc.title} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />
                <span>{svc.title}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(233,30,140,0.5)] hover:scale-105 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Book an Appointment Now</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
