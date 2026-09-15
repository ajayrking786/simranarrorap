'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Video as VideoIcon, ExternalLink } from 'lucide-react'
import type { Video } from '@/types'

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    platform: 'YouTube',
    button_label: 'Watch Now',
    published: true,
    display_order: 0,
  })

  const loadVideos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/videos')
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      })
      if (res.ok) {
        setShowAddModal(false)
        setNewVideo({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          platform: 'YouTube',
          button_label: 'Watch Now',
          published: true,
          display_order: 0,
        })
        await loadVideos()
      } else {
        alert('Failed to add video')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      if (res.ok) await loadVideos()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Video Showcases</h1>
          <p className="text-xs text-gray-400 mt-1">Manage official video links, thumbnails, and display priority.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(233,30,140,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
          No videos added yet. Click &quot;Add Video&quot; above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <div key={v.id} className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">{v.platform || 'Custom'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    v.published ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-white/5'
                  }`}>
                    {v.published ? 'Live' : 'Hidden'}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{v.title}</h3>
                {v.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">{v.description}</p>
                )}
                <a
                  href={v.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#ff2d9c] hover:underline flex items-center gap-1 pt-1"
                >
                  <span className="truncate max-w-[200px]">{v.video_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                <span>Order: {v.display_order}</span>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1 rounded text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border-white/10 space-y-5">
            <h2 className="font-serif text-xl font-bold text-white">Add Video Showcase</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milan Fashion Campaign Film"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Video URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  value={newVideo.video_url}
                  onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold uppercase">Platform</label>
                  <input
                    type="text"
                    placeholder="YouTube / Instagram / Vimeo"
                    value={newVideo.platform}
                    onChange={(e) => setNewVideo({ ...newVideo, platform: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold uppercase">Display Order</label>
                  <input
                    type="number"
                    value={newVideo.display_order}
                    onChange={(e) => setNewVideo({ ...newVideo, display_order: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                  />
                </div>
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
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
