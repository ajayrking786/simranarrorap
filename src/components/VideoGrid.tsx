'use client'

import React from 'react'
import Image from 'next/image'
import { Play, ExternalLink, Video as VideoIcon } from 'lucide-react'
import type { Video } from '@/types'

interface VideoGridProps {
  videos: Video[]
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 glass-card rounded-2xl p-8 max-w-lg mx-auto">
        <VideoIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
        <p className="text-base font-medium text-white">No video showcases published yet.</p>
        <p className="text-xs text-gray-400 mt-1">Please check back soon for our newest cinematic releases.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => {
        const thumb = video.thumbnail_url || 'https://picsum.photos/seed/simran-video-thumb/600/380'

        return (
          <div
            key={video.id}
            className="group glass-card rounded-2xl overflow-hidden flex flex-col justify-between"
          >
            {/* Thumbnail with Play Overlay */}
            <div className="relative aspect-video w-full overflow-hidden bg-[#161616]">
              <Image
                src={thumb}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-85 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#e91e8c]/80 group-hover:bg-[#e91e8c] text-white flex items-center justify-center shadow-[0_0_25px_rgba(233,30,140,0.6)] group-hover:scale-110 transition-all">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>
              </div>
              {video.platform && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-gray-300 border border-white/10">
                  {video.platform}
                </div>
              )}
            </div>

            {/* Information */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff2d9c] transition-colors leading-snug">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-[#e91e8c]/50 bg-[#e91e8c]/10 hover:bg-[#e91e8c] text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <span>{video.button_label || 'Watch Video'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
