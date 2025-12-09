"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MachinesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = (searchParams?.get('search') as string) || ''

  const [machines, setMachines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState<string>(initialSearch)
  const [searchInput, setSearchInput] = useState<string>(initialSearch)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', category: '', brand: '', warrantyTimeInMonths: 12, serialNumber: '' })
  const [createLoading, setCreateLoading] = useState(false)

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<any | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.get('/api/machines', { params: { search: search || undefined } })
        const json = res.data
        setMachines(json.machines || json)
      } catch (err) {
        console.error(err)
        alert('Failed to load machines')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // debounce searchInput -> search and update url
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const params = new URLSearchParams()
        if (searchInput && searchInput.trim() !== '') params.set('search', searchInput.trim())
        const query = params.toString()
        const path = '/admin/machines' + (query ? `?${query}` : '')
        router.replace(path)
      } catch (e) {
        // ignore
      }
      setSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  function openCreateModal() {
    setCreateForm({ name: '', category: '', brand: '', warrantyTimeInMonths: 12, serialNumber: '' })
    setShowCreateModal(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const payload = {
        name: createForm.name,
        category: createForm.category,
        brand: createForm.brand,
        warrantyTimeInMonths: createForm.warrantyTimeInMonths,
        serialNumber: createForm.serialNumber,
      }
      const res = await api.post('/api/machines', payload)
      alert(res.data?.message || 'Machine created')
      setShowCreateModal(false)
      // reload
      const resp = await api.get('/api/machines', { params: { search: search || undefined } })
      setMachines(resp.data.machines || resp.data)
    } catch (err: any) {
      console.error('Failed to create machine:', err)
      alert(err.response?.data?.message || 'Failed to create machine')
    } finally {
      setCreateLoading(false)
    }
  }

  function openDetail(m: any) {
    setSelectedMachine(m)
    setShowDetailModal(true)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Machines</h1>
            <div className="ml-4">
              <input
                type="search"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search machines by name, brand or category"
                className="w-full max-w-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <button onClick={openCreateModal} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Add Machine
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-slate-600">Loading machines...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Brand</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Serial</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Warranty (months)</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {machines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No machines found</td>
                    </tr>
                  ) : (
                    machines.map((m: any) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <button onClick={() => openDetail(m)} className="text-left font-medium text-slate-800 hover:underline">
                            {m.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{m.brand || '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{m.category || '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{m.serialNumber || '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{m.warrantyTimeInMonths ?? '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-3">
                            <button onClick={() => openDetail(m)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Machine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Add Machine</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-white">
                  ✕
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">Create a new machine record</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                <input required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                <input value={createForm.brand} onChange={e => setCreateForm({ ...createForm, brand: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <input value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number</label>
                <input value={createForm.serialNumber} onChange={e => setCreateForm({ ...createForm, serialNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Warranty Time (months)</label>
                <input type="number" value={createForm.warrantyTimeInMonths} onChange={e => setCreateForm({ ...createForm, warrantyTimeInMonths: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={createLoading} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                  {createLoading ? 'Creating...' : 'Create Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMachine && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Machine Details</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-600">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm text-slate-500">Name</h4>
                <div className="font-medium text-slate-800">{selectedMachine.name}</div>
              </div>
              <div>
                <h4 className="text-sm text-slate-500">Brand</h4>
                <div className="font-medium text-slate-800">{selectedMachine.brand || '—'}</div>
              </div>
              <div>
                <h4 className="text-sm text-slate-500">Category</h4>
                <div className="font-medium text-slate-800">{selectedMachine.category || '—'}</div>
              </div>
              <div>
                <h4 className="text-sm text-slate-500">Serial Number</h4>
                <div className="font-medium text-slate-800">{selectedMachine.serialNumber || '—'}</div>
              </div>
              <div>
                <h4 className="text-sm text-slate-500">Warranty (months)</h4>
                <div className="font-medium text-slate-800">{selectedMachine.warrantyTimeInMonths ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
