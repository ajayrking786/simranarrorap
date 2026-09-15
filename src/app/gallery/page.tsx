import React from 'react'
import GalleryGrid from '@/components/GalleryGrid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { GalleryItem } from '@/types'

export const revalidate = 60

export const metadata = {
  title: 'Visual Gallery | Simran Arrora ♡',
  description: 'Explore the curated photography portfolio and editorial lookbooks of Simran Arrora.',
}

// Fallback curated showcase if database hasn't had items inserted yet
const initialDemoItems: GalleryItem[] = [
  {
    id: 'demo-1',
    title: 'Editorial Noir & Velvet',
    description: 'High-contrast studio session exploring luxury textures and dramatic mood lighting.',
    image_url: 'https://picsum.photos/seed/simran-gal-1/800/1000',
    category: 'Editorial',
    alt_text: 'Editorial portrait in velvet attire',
    published: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Neon Twilight Symphony',
    description: 'City nightscape aesthetic with vibrant magenta neon ambient reflections.',
    image_url: 'https://picsum.photos/seed/simran-gal-2/800/1000',
    category: 'Cinematic',
    alt_text: 'Neon glow creative fashion portrait',
    published: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Golden Hour Solitude',
    description: 'Natural warmth and relaxed creative movement captured during sunset.',
    image_url: 'https://picsum.photos/seed/simran-gal-3/800/1000',
    category: 'Lifestyle',
    alt_text: 'Sunset golden hour portrait',
    published: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Minimalist Couture Study',
    description: 'Stripped-back geometric composition highlighting structured monochrome fashion.',
    image_url: 'https://picsum.photos/seed/simran-gal-4/800/1000',
    category: 'Editorial',
    alt_text: 'High-fashion monochrome lookbook',
    published: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Magenta Luminescence',
    description: 'Artistic prism lighting effects paired with delicate styling.',
    image_url: 'https://picsum.photos/seed/simran-gal-5/800/1000',
    category: 'Cinematic',
    alt_text: 'Prism creative portrait',
    published: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    title: 'Runway Backstage Intimacy',
    description: 'Candid moments captured backstage during fashion showcase preparations.',
    image_url: 'https://picsum.photos/seed/simran-gal-6/800/1000',
    category: 'Lifestyle',
    alt_text: 'Backstage candid creative portrait',
    published: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return initialDemoItems
    }
    return data as GalleryItem[]
  } catch {
    return initialDemoItems
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems()

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Visual Portfolio
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          Visual Gallery <span className="text-[#e91e8c]">♡</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          A curated visual anthology of editorial sessions, fashion campaigns, and artistic portraits. Click on any visual to inspect in high-definition lightbox view.
        </p>
      </div>

      <GalleryGrid items={items} />
    </div>
  )
}
