import React from 'react'
import VideoGrid from '@/components/VideoGrid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Video } from '@/types'

export const revalidate = 60

export const metadata = {
  title: 'Video Collection | Simran Arrora ♡',
  description: 'Watch cinematic reels, lifestyle episodes, and behind-the-scenes showcases with Simran Arrora.',
}

// Fallback demo items if no videos are added in DB yet
const initialDemoVideos: Video[] = [
  {
    id: 'vid-1',
    title: 'Autumn Cinematic Fashion Reel',
    description: 'An exploration of autumn fabrics, silhouette styling, and atmospheric urban lighting.',
    thumbnail_url: 'https://picsum.photos/seed/simran-video-1/600/380',
    video_url: 'https://youtube.com',
    platform: 'YouTube',
    button_label: 'Watch on YouTube',
    published: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Backstage: Editorial Studio Session',
    description: 'Exclusive look behind the lenses during our seasonal campaign shoot in Mumbai.',
    thumbnail_url: 'https://picsum.photos/seed/simran-video-2/600/380',
    video_url: 'https://youtube.com',
    platform: 'YouTube',
    button_label: 'Watch Highlights',
    published: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    title: 'Creative Direction & Moodboarding',
    description: 'Step-by-step insight into conceptualizing visual aesthetics and collaborating with stylists.',
    thumbnail_url: 'https://picsum.photos/seed/simran-video-3/600/380',
    video_url: 'https://instagram.com',
    platform: 'Instagram',
    button_label: 'Watch on Instagram',
    published: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

async function getVideos(): Promise<Video[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return initialDemoVideos
    }
    return data as Video[]
  } catch {
    return initialDemoVideos
  }
}

export default async function VideosPage() {
  const videos = await getVideos()

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Motion &amp; Cinema
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          Video Collection <span className="text-[#e91e8c]">♡</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Cinematic reels, creative campaign diaries, and behind-the-scenes moments. All video links open directly in verified official platforms.
        </p>
      </div>

      <VideoGrid videos={videos} />
    </div>
  )
}
