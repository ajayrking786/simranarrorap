'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Clock, Tag } from 'lucide-react'
import type { Service } from '@/types'

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    enabled: true,
    display_order: 0,
  })

  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data.services || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      })
      if (res.ok) {
        setShowAddModal(false)
        setNewService({ name: '', description: '', duration_minutes: 60, enabled: true, display_order: 0 })
        await loadServices()
      } else {
        alert('Failed to create service')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadServices()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleEnable = async (svc: Service) => {
    try {
      await fetch(`/api/admin/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !svc.enabled }),
      })
      await loadServices()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Services Management</h1>
          <p className="text-xs text-gray-400 mt-1">Configure permissible creative services and session durations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(233,30,140,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 mx-auto border-2 border-[#e91e8c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-xs glass-card rounded-2xl p-8">
          No services created yet. Click &quot;Add Service&quot; above to create your first offering.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">Order: {s.display_order}</span>
                  <button
                    onClick={() => handleToggleEnable(s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      s.enabled
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {s.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <h3 className="font-bold text-white text-lg">{s.name}</h3>
                {s.description && (
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{s.description}</p>
                )}
                {s.duration_minutes && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-[#e91e8c]" />
                    <span>{s.duration_minutes} minutes</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {s.price_options?.length || 0} price tier(s)
                </span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border-white/10 space-y-5">
            <h2 className="font-serif text-xl font-bold text-white">Create New Service</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brand Commercial Shoot"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold uppercase">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details of deliverables, styling requirements, and session scope..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold uppercase">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({ ...newService, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#e91e8c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold uppercase">Display Order</label>
                  <input
                    type="number"
                    value={newService.display_order}
                    onChange={(e) => setNewService({ ...newService, display_order: Number(e.target.value) })}
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
