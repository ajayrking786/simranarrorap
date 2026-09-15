'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import type { GalleryItem } from '@/types'

interface GalleryGridProps {
  items: GalleryItem[]
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category || 'Editorial')))]

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((item) => (item.category || 'Editorial') === activeCategory)

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') setSelectedIndex(null)
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0))
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, filteredItems.length])

  return (
    <div className="space-y-10">
      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white shadow-[0_0_15px_rgba(233,30,140,0.5)]'
                  : 'bg-[#161616] text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 text-gray-500 glass-card rounded-2xl p-8">
          <p className="text-sm">No visuals in this category yet. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-card cursor-pointer bg-[#141414]"
            >
              <Image
                src={item.image_url}
                alt={item.alt_text || item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[11px] font-semibold text-[#ff2d9c] uppercase tracking-widest">
                  {item.category || 'Editorial'}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">{item.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/80 font-medium">
                  <Maximize2 className="w-3.5 h-3.5 text-[#e91e8c]" />
                  <span>Click to view</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedIndex !== null && filteredItems[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-[#e91e8c] transition-all z-50 focus:outline-none"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1))
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-[#e91e8c] transition-all z-50 focus:outline-none"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0))
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-[#e91e8c] transition-all z-50 focus:outline-none"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption Container */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center relative">
            <div className="relative w-[90vw] max-w-3xl h-[65vh] sm:h-[75vh]">
              <Image
                src={filteredItems[selectedIndex].image_url}
                alt={filteredItems[selectedIndex].alt_text || filteredItems[selectedIndex].title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 text-center max-w-xl px-4">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {filteredItems[selectedIndex].title}
              </h3>
              {filteredItems[selectedIndex].description && (
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {filteredItems[selectedIndex].description}
                </p>
              )}
              <span className="text-[11px] text-gray-500 mt-2 block">
                {selectedIndex + 1} of {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
