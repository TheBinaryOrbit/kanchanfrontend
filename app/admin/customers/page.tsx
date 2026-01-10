"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Plus, Search, ChevronLeft, ChevronRight, User, Mail, Phone, MapPin } from 'lucide-react'

type Customer = {
  id: string
  uid?: string
  name: string
  phone?: string
  email?: string
  address?: string
}

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialSearch = (searchParams?.get('search') as string) || ''
  const initialPage = parseInt((searchParams?.get('page') as string) || '1', 10) || 1
  const initialLimit = parseInt((searchParams?.get('limit') as string) || '20', 10) || 20

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', street: '', city: '', state: '', pincode: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState(initialSearch)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [page, setPage] = useState<number>(initialPage)
  const [limit, setLimit] = useState<number>(initialLimit)

  // Machine selection state
  const [machines, setMachines] = useState<any[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([])
  const [machineSearchQuery, setMachineSearchQuery] = useState('')

  useEffect(() => {
    const spSearch = (searchParams?.get('search') as string) || ''
    const spPage = parseInt((searchParams?.get('page') as string) || '1', 10) || 1
    const spLimit = parseInt((searchParams?.get('limit') as string) || '20', 10) || 20
    setSearch(spSearch)
    setSearchInput(spSearch)
    setPage(spPage)
    setLimit(spLimit)
  }, [searchParams])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/customers', { params: { search: search || undefined, page, limit } })
      const data = res.data
      setCustomers(data.customers || data || [])
    } catch (err) {
      console.error(err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  async function loadMachines() {
    setLoadingMachines(true)
    try {
      const res = await api.get('/api/machines')
      const data = res.data
      setMachines(data.machines || data || [])
    } catch (err) {
      console.error('Failed to load machines:', err)
      setMachines([])
    } finally {
      setLoadingMachines(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload: any = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: `${form.street || ''} | ${form.city || ''} | ${form.state || ''} | ${form.pincode || ''}`,
      }
      
      // Add machine IDs if selected
      if (selectedMachineIds.length > 0) {
        payload.machineIds = selectedMachineIds
      }
      
      const res = await api.post('/api/customers', payload)
      if (res.status >= 200 && res.status < 300) {
        await load()
        setShowCreate(false)
        setForm({ name: '', phone: '', email: '', street: '', city: '', state: '', pincode: '' })
        setSelectedMachineIds([])
        setMachineSearchQuery('')
      } else {
        alert(res.data?.message || 'Error')
      }
    } catch (err) {
      console.error(err)
    }
  }

  function openDeleteModal(customer: Customer) {
    setCustomerToDelete(customer)
    setShowDeleteModal(true)
  }

  async function handleDelete() {
    if (!customerToDelete) return

    try {
      setDeleting(true)
      await api.delete(`/api/customers/${customerToDelete.id}`)
      setSelectedCustomer(null)
      setShowDeleteModal(false)
      setCustomerToDelete(null)
      await load()
    } catch (err) {
      console.error(err)
      alert('Failed to delete customer')
    } finally {
      setDeleting(false)
    }
  }

  const parseAddress = (address?: string) => {
    if (!address) return { street: '', city: '', state: '', pincode: '' }
    const parts = address.split('|').map(p => p.trim())
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      pincode: parts[3] || ''
    }
  }

  return (
    <div className="min-h-screen ">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Customers</h1>
          <p className="text-slate-600">Manage your customer database</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
          <form 
            onSubmit={(e) => { 
              e.preventDefault()
              setPage(1)
              setSearch(searchInput)
              router.push(`/admin/customers?search=${encodeURIComponent(searchInput)}&page=1&limit=${limit}`)
            }} 
            className="flex items-center gap-3 flex-1 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                placeholder="Search customers..." 
                value={searchInput} 
                onChange={e => setSearchInput(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
          
          <button 
            onClick={() => {
              setShowCreate(true)
              loadMachines() // Load machines when opening create modal
            }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading customers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Phone</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Address</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{c.email || '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{c.phone || '—'}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                          {c.address ? parseAddress(c.address).city || c.address : '—'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button 
                            onClick={() => setSelectedCustomer(c)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View
                          </button>

                          <button 
                            onClick={() => openDeleteModal(c)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page <span className="font-semibold">{page}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1} 
                  onClick={() => { 
                    const np = Math.max(1, page - 1)
                    setPage(np)
                    router.push(`/admin/customers?search=${encodeURIComponent(search)}&page=${np}&limit=${limit}`)
                  }} 
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button 
                  onClick={() => { 
                    const np = page + 1
                    setPage(np)
                    router.push(`/admin/customers?search=${encodeURIComponent(search)}&page=${np}&limit=${limit}`)
                  }} 
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-medium text-slate-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-slate-800">Create New Customer</h2>
              <button 
                onClick={() => setShowCreate(false)} 
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input 
                    required
                    placeholder="John Doe" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input 
                    placeholder="+91 98765 43210" 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email"
                    placeholder="john@example.com" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                  <input 
                    placeholder="123 Main Street" 
                    value={form.street} 
                    onChange={e => setForm({ ...form, street: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input 
                    placeholder="Mumbai" 
                    value={form.city} 
                    onChange={e => setForm({ ...form, city: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                  <input 
                    placeholder="Maharashtra" 
                    value={form.state} 
                    onChange={e => setForm({ ...form, state: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                  <input 
                    placeholder="400001" 
                    value={form.pincode} 
                    onChange={e => setForm({ ...form, pincode: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Machine Selection Section */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Associate Machines</h3>
                    <p className="text-sm text-slate-600 mt-1">Select machines to link with this customer (Optional)</p>
                  </div>
                  {machines.length === 0 && !loadingMachines && (
                    <button
                      type="button"
                      onClick={loadMachines}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Load Machines
                    </button>
                  )}
                </div>

                {loadingMachines ? (
                  <div className="flex items-center justify-center py-12 bg-slate-50 rounded-lg">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-slate-600">Loading machines...</span>
                  </div>
                ) : machines.length > 0 ? (
                  <>
                    {/* Machine Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search machines by name, category, brand, or serial number..."
                          value={machineSearchQuery}
                          onChange={e => setMachineSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {machineSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setMachineSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Machine List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
                      {machines
                        .filter(machine => {
                          if (!machineSearchQuery) return true
                          const query = machineSearchQuery.toLowerCase()
                          return (
                            machine.name?.toLowerCase().includes(query) ||
                            machine.category?.toLowerCase().includes(query) ||
                            machine.brand?.toLowerCase().includes(query) ||
                            machine.serialNumber?.toLowerCase().includes(query)
                          )
                        })
                        .map(machine => {
                          const isSelected = selectedMachineIds.includes(machine.id)
                          return (
                            <div
                              key={machine.id}
                              onClick={() => {
                                setSelectedMachineIds(prev =>
                                  prev.includes(machine.id)
                                    ? prev.filter(id => id !== machine.id)
                                    : [...prev, machine.id]
                                )
                              }}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-slate-900">{machine.name}</h4>
                                  </div>
                                  <div className="mt-1 text-sm text-slate-600 space-y-0.5">
                                    <div>{machine.category} • {machine.brand}</div>
                                    {machine.serialNumber && (
                                      <div className="text-xs text-slate-500">SN: {machine.serialNumber}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  {isSelected ? (
                                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="h-6 w-6 border-2 border-slate-300 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    {selectedMachineIds.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                          {selectedMachineIds.length} machine{selectedMachineIds.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No machines available</h3>
                    <p className="mt-1 text-sm text-slate-500">Create machines first to associate them with customers</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Create Customer
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 rounded-t-2xl relative">
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedCustomer.name}</h2>
                  <p className="text-blue-100 mt-1">Customer Details</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Email Address</div>
                  <div className="text-slate-800 mt-1">{selectedCustomer.email || 'Not provided'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Phone className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Phone Number</div>
                  <div className="text-slate-800 mt-1">{selectedCustomer.phone || 'Not provided'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Address</div>
                  {selectedCustomer.address ? (
                    <div className="text-slate-800 mt-1">
                      {(() => {
                        const addr = parseAddress(selectedCustomer.address)
                        return (
                          <div className="space-y-1">
                            {addr.street && <div>{addr.street}</div>}
                            {addr.city && <div>{addr.city}, {addr.state} {addr.pincode}</div>}
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-slate-800 mt-1">Not provided</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Customer ID</div>
                  <div className="text-slate-800 mt-1 font-mono text-sm">{selectedCustomer.id}</div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button 
                onClick={() => openDeleteModal(selectedCustomer!)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Customer
              </button>

              <button 
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Delete Customer</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">{customerToDelete.name}</span>? This will permanently remove the customer and all related records.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Customer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
