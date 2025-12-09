"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Calendar, CreditCard, Eye, Phone, Search } from 'lucide-react'

export default function ServicesPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [createLoading, setCreateLoading] = useState(false)

  const [createForm, setCreateForm] = useState({
    customerId: '',
    machineId: '',
    purchaseDate: '',
    pendingAmount: 0
  })

  const [customerSearch, setCustomerSearch] = useState('')
  const [machineSearch, setMachineSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/service-records')
        setRecords(res.data.serviceRecords || res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function fmtDate(d: string | undefined) {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleString()
    } catch (e) {
      return d
    }
  }

  async function openCreateModal() {
    setShowCreateModal(true)
    setCreateForm({ customerId: '', machineId: '', purchaseDate: new Date().toISOString().split('T')[0], pendingAmount: 0 })
    setCustomerSearch('')
    setMachineSearch('')

    try {
      const [custRes, machRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/machines')
      ])
      setCustomers(custRes.data.customers || custRes.data || [])
      setMachines(machRes.data.machines || machRes.data || [])
    } catch (err) {
      console.error('Failed to load customers/machines:', err)
      alert('Failed to load data for form')
    }
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const payload = {
        customerId: createForm.customerId,
        machineId: createForm.machineId,
        purchaseDate: createForm.purchaseDate,
        pendingAmount: Number(createForm.pendingAmount)
      }
      const res = await api.post('/api/service-records', payload)
      alert(res.data?.message || 'Service record created successfully')
      setShowCreateModal(false)

      // Reload records
      const reloadRes = await api.get('/api/service-records')
      setRecords(reloadRes.data.serviceRecords || reloadRes.data || [])
    } catch (err: any) {
      console.error('Failed to create service record:', err)
      alert(err.response?.data?.message || 'Failed to create service record')
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c =>
    !customerSearch ||
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  )

  const filteredMachines = machines.filter(m =>
    !machineSearch ||
    m.name?.toLowerCase().includes(machineSearch.toLowerCase()) ||
    m.brand?.toLowerCase().includes(machineSearch.toLowerCase()) ||
    m.category?.toLowerCase().includes(machineSearch.toLowerCase()) ||
    m.serialNumber?.toLowerCase().includes(machineSearch.toLowerCase())
  )

  // Filter service records by customer name or machine name
  const filteredRecords = records.filter(r => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const customerName = r.customer?.name?.toLowerCase() || ''
    const machineName = r.machine?.name?.toLowerCase() || ''
    return customerName.includes(searchLower) || machineName.includes(searchLower)
  })

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Service Records</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customer service records and warranties</p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Service Record
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 w-full relative flex justify-end">
          <div className="w-full max-w-md relative">
            {/* Icon */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            {/* Input */}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name or machine name..."
              className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-slate-600">Loading service records...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Machine Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Warranty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-lg font-medium">No service records found</p>
                          <p className="text-sm mt-1">Start by adding a new service record</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50 transition-all duration-150 group"
                      >
                        {/* Customer Column */}
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {r.customer?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col">
                              <div className="text-sm font-semibold text-slate-900">
                                {r.customer?.name || '—'}
                              </div>
                              <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                <Phone className="w-3 h-3 mr-1" />
                                {r.customer?.phone || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Machine Column */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-slate-900 mb-1">
                              {r.machine?.name || '—'}
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              {r.machine?.brand && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                                  {r.machine.brand}
                                </span>
                              )}
                              {r.machine?.category && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">
                                  {r.machine.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Purchase Date Column */}
                        <td className="px-6 py-5">
                          <div className="flex items-center text-sm text-slate-700">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            {new Date(r.purchaseDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Warranty Status Column */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${r.warrantyStatus || r.status === 'Active'
                            ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                            {r.warrantyStatus || r.status}
                          </span>
                        </td>

                        {/* Payment Status Column */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-2">

                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${r.hasPendingAmount
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                              }`}>
                              {r.hasPendingAmount ? '⚠ Pending' : '✓ Paid'}
                            </span>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-5 text-center">
                          <a
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-150 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            href={`/admin/services/${r.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Service Record Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-scrollbar" >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Create Service Record</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateService} className="p-6 space-y-6">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search customer by name, email or phone..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <div className="border border-slate-300 rounded-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No customers found</div>
                    ) : (
                      filteredCustomers.map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCreateForm({ ...createForm, customerId: c.id })
                            setCustomerSearch(c.name)
                          }}
                          className={`p-3 cursor-pointer border-b border-slate-200 last:border-0 ${createForm.customerId === c.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50'
                            }`}
                        >
                          <div className="font-medium text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.email} • {c.phone}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Machine Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Machine <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search machine by name, brand, category or serial..."
                    value={machineSearch}
                    onChange={e => setMachineSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <div className="border border-slate-300 rounded-lg max-h-48 overflow-y-auto">
                    {filteredMachines.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No machines found</div>
                    ) : (
                      filteredMachines.map((m: any) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setCreateForm({ ...createForm, machineId: m.id })
                            setMachineSearch(m.name)
                          }}
                          className={`p-3 cursor-pointer border-b border-slate-200 last:border-0 ${createForm.machineId === m.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50'
                            }`}
                        >
                          <div className="font-medium text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.brand} • {m.category} • SN: {m.serialNumber}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.purchaseDate}
                    onChange={e => setCreateForm({ ...createForm, purchaseDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Pending Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pending Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.pendingAmount}
                    onChange={e => setCreateForm({ ...createForm, pendingAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={createLoading || !createForm.customerId || !createForm.machineId || !createForm.purchaseDate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Service Record'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
