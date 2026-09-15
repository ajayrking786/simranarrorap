'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import type { GalleryItem } from '@/types'

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'Editorial',
    alt_text: '',
    published: true,
    display_order: 0,
  })

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        setShowAddModal(false)
        setNewItem({
          title: '',
          description: '',
          image_url: '',
          category: 'Editorial',
          alt_text: '',
          published: true,
          display_order: 0,
        })
        await loadItems()
      } else {
        alert('Failed to add image')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (res.ok) await loadItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !item.published }),
      })
      await loadItems()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Visual Gallery Management</h1>
          <p className="text-xs text-gray-400 mt-1">Manage public lookbooks, portfolio photographs, and display order.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(233,30,140,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Visual</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading visuals...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
          No visuals added yet. Click &quot;Add Visual&quot; above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.id} className="glass-panel rounded-2xl overflow-hidden border-white/10 flex flex-col justify-between">
              <div className="relative aspect-[3/4] w-full bg-[#141414]">
                <Image
                  src={it.image_url}
                  alt={it.alt_text || it.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
                <button
                  onClick={() => handleTogglePublish(it)}
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 backdrop-blur-md ${
                    it.published
                      ? 'bg-green-500/80 text-white'
                      : 'bg-black/80 text-yellow-400 border border-yellow-400/40'
                  }`}
                >
                  {it.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{it.published ? 'Live' : 'Draft'}</span>
                </button>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] font-semibold text-[#ff2d9c] uppercase tracking-wider">
                  {it.category || 'Editorial'}
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1">{it.title}</h4>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                  <span>Order: {it.display_order}</span>
                  <button
                    onClick={() => handleDelete(it.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-500/10"
                    title="Delete visual"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Visual Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border-white/10 space-y-5">
            <h2 className="font-serif text-xl font-bold text-white">Add Visual to Gallery</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Editorial Twilight Noir"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://... or /assets/images/..."
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold uppercase">Category</label>
                  <input
                    type="text"
                    placeholder="Editorial / Cinematic / Lookbook"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold uppercase">Display Order</label>
                  <input
                    type="number"
                    value={newItem.display_order}
                    onChange={(e) => setNewItem({ ...newItem, display_order: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Alt Text</label>
                <input
                  type="text"
                  placeholder="Accessible description of portrait"
                  value={newItem.alt_text}
                  onChange={(e) => setNewItem({ ...newItem, alt_text: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e91e8c] text-white font-bold uppercase tracking-wider hover:bg-[#ff2d9c]"
                >
                  Save Visual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
