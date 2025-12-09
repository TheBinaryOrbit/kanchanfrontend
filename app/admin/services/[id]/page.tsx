"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

export default function ServiceDetails() {
  const params = useParams()
  const id = (params as any)?.id
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get(`/api/service-records/${id}`)
        setRecord(res.data.serviceRecord || res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const [showPointModal, setShowPointModal] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<any>(null)
  const [engineers, setEngineers] = useState<any[]>([])
  const [reassignForm, setReassignForm] = useState({ assignedToId: '' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: ''
  })
  
  // Report creation state
  const [showCreateReportModal, setShowCreateReportModal] = useState(false)
  const [createReportLoading, setCreateReportLoading] = useState(false)
  const [reportForm, setReportForm] = useState({
    summary: '',
    scanNotes: '',
    scanPages: '',
    manualFile: null as File | null,
    eDrawingsFile: null as File | null
  })

  // Status update state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function loadEngineers() {
    try {
      const res = await api.get('/api/users?role=ENGINEER')
      setEngineers(res.data.users || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function updatePointStatus(pointId: string, status: string) {
    try {
      // Send full point data when updating status
      const payload = {
        title: selectedPoint.title,
        description: selectedPoint.description,
        status: status,
        priority: selectedPoint.priority,
        assignedToId: selectedPoint.assignedToId,
        dueDate: selectedPoint.dueDate
      }
      await api.put(`/api/points/${pointId}`, payload)
      // Refresh record
      const res = await api.get(`/api/service-records/${id}`)
      setRecord(res.data.serviceRecord || res.data)
      setShowPointModal(false)
      alert('Point status updated')
    } catch (err) {
      console.error(err)
      alert('Error updating status')
    }
  }

  async function updatePoint(updates: any) {
    if (!selectedPoint) return
    try {
      const payload = {
        title: selectedPoint.title,
        description: selectedPoint.description,
        status: selectedPoint.status,
        priority: selectedPoint.priority,
        assignedToId: selectedPoint.assignedToId,
        dueDate: selectedPoint.dueDate,
        ...updates
      }
      await api.put(`/api/points/${selectedPoint.id}`, payload)
      // Refresh record
      const res = await api.get(`/api/service-records/${id}`)
      setRecord(res.data.serviceRecord || res.data)
      setShowPointModal(false)
      alert('Point updated successfully')
    } catch (err) {
      console.error(err)
      alert('Error updating point')
    }
  }

  async function reassignPoint() {
    if (!selectedPoint || !reassignForm.assignedToId) return
    updatePoint({ assignedToId: reassignForm.assignedToId, status: 'REASSIGNED' })
    setReassignForm({ assignedToId: '' })
  }

  function openPointModal(point: any) {
    setSelectedPoint(point)
    setShowPointModal(true)
    loadEngineers()
  }

  function openCreateModal() {
    setCreateForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToId: '',
      dueDate: ''
    })
    setShowCreateModal(true)
    loadEngineers()
  }

  async function createPoint() {
    if (!createForm.title || !createForm.description || !createForm.assignedToId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await api.post('/api/points', {
        ...createForm,
        serviceRecordId: id,
        status: 'CREATED'
      })
      
      // Refresh record
      const res = await api.get(`/api/service-records/${id}`)
      setRecord(res.data.serviceRecord || res.data)
      setShowCreateModal(false)
      alert('Point created successfully')
    } catch (err: any) {
      console.error('Failed to create point:', err)
      alert(err.response?.data?.message || 'Failed to create point')
    }
  }

  function openCreateReportModal() {
    setReportForm({
      summary: '',
      scanNotes: '',
      scanPages: '',
      manualFile: null,
      eDrawingsFile: null
    })
    setShowCreateReportModal(true)
  }

  async function uploadFile(file: File, type: 'manual' | 'edrawings'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = localStorage.getItem('adminToken')
    const res = await fetch(`http://localhost:3000/api/reports/upload/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.fileUrl
  }

  async function createReport() {
    if (!reportForm.summary) {
      alert('Please fill in the summary field')
      return
    }

    setCreateReportLoading(true)
    try {
      let manualUrl = ''
      let eDrawingsUrl = ''

      // Upload files if selected
      if (reportForm.manualFile) {
        manualUrl = await uploadFile(reportForm.manualFile, 'manual')
      }
      if (reportForm.eDrawingsFile) {
        eDrawingsUrl = await uploadFile(reportForm.eDrawingsFile, 'edrawings')
      }

      // Create report
      await api.post('/api/reports', {
        serviceRecordId: id,
        reportData: {
          summary: reportForm.summary,
        },
        scanData: {
          notes: reportForm.scanNotes,
          pages: reportForm.scanPages
        },
        manualUrl: manualUrl || undefined,
        eDrawingsUrl: eDrawingsUrl || undefined
      })

      // Refresh record
      const res = await api.get(`/api/service-records/${id}`)
      setRecord(res.data.serviceRecord || res.data)
      setShowCreateReportModal(false)
      alert('Report created successfully')
    } catch (err: any) {
      console.error('Failed to create report:', err)
      alert(err.response?.data?.message || 'Failed to create report')
    } finally {
      setCreateReportLoading(false)
    }
  }

  async function updateServiceStatus(newStatus: string) {
    setUpdatingStatus(true)
    try {
      await api.put(`/api/service-records/${id}`, {
        status: newStatus
      })

      // Refresh record
      const res = await api.get(`/api/service-records/${id}`)
      setRecord(res.data.serviceRecord || res.data)
      setShowStatusDropdown(false)
      alert('Status updated successfully')
    } catch (err: any) {
      console.error('Failed to update status:', err)
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  function fmtDate(d: string | undefined) {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleString()
    } catch (e) {
      return d
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!record) return <div className="p-6">Service record not found</div>

  const addressParts = (record.customer?.address || '').split('|').map((s: string) => s.trim())
  const [street = '', city = '', state = '', pincode = ''] = addressParts

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Service Record Details</h1>
          <p className="text-slate-600 mt-1">Comprehensive service information and management</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            disabled={updatingStatus}
            className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex items-center gap-2"
          >
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              record.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
              record.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
              record.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>{record.status}</span>
            <svg className={`w-4 h-4 text-slate-600 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Status Dropdown */}
          {showStatusDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
              {['ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateServiceStatus(status)}
                  disabled={updatingStatus || record.status === status}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                    record.status === status ? 'bg-slate-100 cursor-not-allowed' : ''
                  }`}
                >
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                    status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {status}
                  </span>
                  {record.status === status && (
                    <svg className="w-4 h-4 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-800">Customer Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500 block mb-1">Name</span>
              <span className="font-medium text-slate-800">{record.customer?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">UID</span>
              <span className="font-medium text-slate-700">{record.customer?.uid}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Phone</span>
              <span className="font-medium text-slate-700">{record.customer?.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Email</span>
              <span className="font-medium text-slate-700">{record.customer?.email}</span>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-500 block mb-2 font-medium">Address</span>
              <div className="text-slate-700 space-y-1">
                {street && <div>{street}</div>}
                {city && <div>{city}, {state}</div>}
                {pincode && <div>PIN: {pincode}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Machine Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-800">Machine Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500 block mb-1">Name</span>
              <span className="font-medium text-slate-800">{record.machine?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Brand</span>
              <span className="font-medium text-slate-700">{record.machine?.brand}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Category</span>
              <span className="font-medium text-slate-700">{record.machine?.category}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Serial Number</span>
              <span className="font-mono text-slate-700">{record.machine?.serialNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Warranty Period</span>
              <span className="font-medium text-slate-700">{record.machine?.warrantyTimeInMonths} months</span>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-800">Service Details</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500 block mb-1">Record ID</span>
              <span className="font-mono text-slate-700">{record.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Purchase Date</span>
              <span className="font-medium text-slate-700">{fmtDate(record.purchaseDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Warranty Expires</span>
              <span className="font-medium text-slate-700">{fmtDate(record.warrantyExpiresAt)}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Warranty Days Remaining</span>
              <span className={`font-medium ${
                record.warrantyDaysRemaining > 30 ? 'text-green-600' : 
                record.warrantyDaysRemaining > 0 ? 'text-orange-600' : 'text-red-600'
              }`}>{record.warrantyDaysRemaining} days</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Pending Amount</span>
              <span className="font-semibold text-lg text-slate-800">₹{(record.pendingAmount || 0).toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-500 block mb-1">Created By</span>
              <span className="font-medium text-slate-700">{record.createdBy?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Created At</span>
              <span className="text-slate-700">{fmtDate(record.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {record.kpis && Object.keys(record.kpis).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {record.kpis.onTimeDelivery !== undefined && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 text-sm block mb-2">On Time Delivery</span>
                <span className={`text-lg font-semibold ${
                  record.kpis.onTimeDelivery ? 'text-green-600' : 'text-red-600'
                }`}>{record.kpis.onTimeDelivery ? '✓ Yes' : '✗ No'}</span>
              </div>
            )}
            {record.kpis.installationRating && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 text-sm block mb-2">Installation Rating</span>
                <span className="text-lg font-semibold text-slate-800">{record.kpis.installationRating}/5 ⭐</span>
              </div>
            )}
            {record.kpis.customerSatisfaction && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 text-sm block mb-2">Customer Satisfaction</span>
                <span className="text-lg font-semibold text-slate-800">{record.kpis.customerSatisfaction}/5 ⭐</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
            <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{record.reports?.length || 0}</span>
          </h3>
          <button
            onClick={openCreateReportModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Report
          </button>
        </div>
        <div className="space-y-3">
          {record.reports?.map((report: any) => (
            <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{report.reportData?.summary || 'Report'}</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mt-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {report.engineer?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {fmtDate(report.createdAt)}
                    </span>
                  </div>
                  {report.reportData?.readings && (
                    <div className="text-sm mt-3 p-2 bg-white rounded border border-slate-200">
                      <span className="font-medium text-slate-700">Readings:</span> {Object.entries(report.reportData.readings).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  )}
                  {report.scanData?.notes && (
                    <div className="text-sm mt-2 text-slate-600">
                      <span className="font-medium">Scan Notes:</span> {report.scanData?.notes} • <span className="font-medium">Pages:</span> {report.scanData?.pages}
                    </div>
                  )}
                </div>
                <div className="ml-4 space-y-2 flex-shrink-0">
                  {report.manualUrl && (
                    <a href={`https://2q766kvz-3000.inc1.devtunnels.ms${report.manualUrl}`} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Manual
                    </a>
                  )}
                  {report.eDrawingsUrl && (
                    <a href={`https://2q766kvz-3000.inc1.devtunnels.ms/${report.eDrawingsUrl}`} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      eDrawings
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Service Points
            <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{record.points?.length || 0}</span>
          </h3>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Point
          </button>
        </div>
        <div className="space-y-3">
          {record.points?.map((point: any) => (
            <div key={point.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{point.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{point.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      point.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      point.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {point.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      point.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      point.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {point.priority}
                    </span>
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {point.assignedTo?.name}
                    </span>
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {fmtDate(point.dueDate)}
                    </span>
                  </div>
                  {point.completedAt && (
                    <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed: {fmtDate(point.completedAt)}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => openPointModal(point)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex-shrink-0"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Point Management Modal */}
      {showPointModal && selectedPoint && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold text-slate-800">Manage Point</h3>
              <p className="text-sm text-slate-600 mt-1">{selectedPoint.title}</p>
            </div>
            <div className="p-6 space-y-6">
            
            {/* Status Update */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Update Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {['CREATED', 'ASSIGNED', 'REASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].map(status => (
                  <button
                    key={status}
                    onClick={() => updatePoint({ status: status.toUpperCase() })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPoint.status === status 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Update */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Update Priority</h4>
              <div className="grid grid-cols-3 gap-2">
                {['LOW', 'MEDIUM', 'HIGH'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => updatePoint({ priority: priority })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPoint.priority === priority 
                        ? priority === 'HIGH' ? 'bg-red-600 text-white shadow-sm' :
                          priority === 'MEDIUM' ? 'bg-orange-600 text-white shadow-sm' :
                          'bg-green-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Reassignment */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Reassign Point</h4>
              <select 
                value={reassignForm.assignedToId} 
                onChange={e => setReassignForm({...reassignForm, assignedToId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              >
                <option value="">Select Engineer</option>
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.id}>{eng.name} ({eng.uid})</option>
                ))}
              </select>
              <button
                onClick={reassignPoint}
                disabled={!reassignForm.assignedToId}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Reassign Engineer
              </button>
            </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-lg">
              <button
                onClick={() => setShowPointModal(false)}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Point Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Point
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">Add a new point to this service record</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  Point Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={createForm.title}
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter point title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-20 resize-none"
                  placeholder="Describe the point details..."
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={createForm.priority}
                  onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="LOW">🟢 Low Priority</option>
                  <option value="MEDIUM">🟡 Medium Priority</option>
                  <option value="HIGH">🔴 High Priority</option>
                </select>
              </div>

              {/* Assigned Engineer */}
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign to Engineer <span className="text-red-500">*</span>
                </label>
                <select
                  id="assignedTo"
                  value={createForm.assignedToId}
                  onChange={e => setCreateForm({ ...createForm, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Engineer</option>
                  {engineers.map(eng => (
                    <option key={eng.id} value={eng.id}>{eng.name} ({eng.uid})</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={createForm.dueDate}
                  onChange={e => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-200 rounded-b-lg flex items-center justify-between gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={createPoint}
                disabled={!createForm.title || !createForm.description || !createForm.assignedToId}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create Point
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4 no-scrollbar">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Create New Report
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">Add a new service report</p>
                </div>
                <button
                  onClick={() => setShowCreateReportModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6 no-scrollbar" >
              {/* Report Data Section */}
              <div className="space-y-4 no-scrollbar">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Report Information
                </h4>

                <div>
                  <label htmlFor="summary" className="block text-sm font-semibold text-slate-700 mb-2">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="summary"
                    type="text"
                    value={reportForm.summary}
                    onChange={e => setReportForm({ ...reportForm, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Brief summary of the report"
                    required
                  />
                </div>
              </div>

              {/* Scan Data Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Scan Information 
                </h4>

                <div >
                  <label htmlFor="scanNotes" className="block text-sm font-semibold text-slate-700 mb-2">
                    Scan Notes <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="scanNotes"
                    type="text"
                    value={reportForm.scanNotes}
                    onChange={e => setReportForm({ ...reportForm, scanNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Scan notes"
                  />
                </div>

                <div>
                  <label htmlFor="scanPages" className="block text-sm font-semibold text-slate-700 mb-2">
                    Pages Scanned <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="scanPages"
                    type="text"
                    value={reportForm.scanPages}
                    onChange={e => setReportForm({ ...reportForm, scanPages: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Number of pages"
                  />
                </div>
              </div>

              {/* File Uploads Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  File Attachments
                </h4>

                <div>
                  <label htmlFor="manualFile" className="block text-sm font-semibold text-slate-700 mb-2">
                    Manual (PDF)
                  </label>
                  <input
                    id="manualFile"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => setReportForm({ ...reportForm, manualFile: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  {reportForm.manualFile && (
                    <p className="text-sm text-slate-600 mt-1">Selected: {reportForm.manualFile.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="eDrawingsFile" className="block text-sm font-semibold text-slate-700 mb-2">
                    E-Drawings (DWG)
                  </label>
                  <input
                    id="eDrawingsFile"
                    type="file"
                    accept=".dwg,.dxf,application/acad,application/x-autocad,application/dwg,application/x-dwg,application/octet-stream"
                    onChange={e => setReportForm({ ...reportForm, eDrawingsFile: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  {reportForm.eDrawingsFile && (
                    <p className="text-sm text-slate-600 mt-1">Selected: {reportForm.eDrawingsFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-200 rounded-b-lg flex items-center justify-between gap-3">
              <button
                onClick={() => setShowCreateReportModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                disabled={createReportLoading}
              >
                Cancel
              </button>
              
              <button
                onClick={createReport}
                disabled={!reportForm.summary || createReportLoading}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
              >
                {createReportLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
