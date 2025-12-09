"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function AdminReportsPage() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0,10)
        const response = await api.get(`/api/admin/reports/summary?from=2025-01-01&to=${today}`)
        setReport(response.data)
      } catch (err) {
        console.error('Failed to load reports:', err)
        alert('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div>Loading reports...</div>

  return (
    <div>
      <h1 className="text-2xl mb-4">Admin Reports Summary</h1>
      {report ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">Installations<br /><strong>{report.totalInstallations ?? '-'}</strong></div>
          <div className="p-4 bg-white rounded shadow">Completed Services<br /><strong>{report.totalCompletedServices ?? '-'}</strong></div>
          <div className="p-4 bg-white rounded shadow">Pending Amount<br /><strong>{report.totalPendingAmount ?? '-'}</strong></div>
        </div>
      ) : (
        <div>No data</div>
      )}
    </div>
  )
}
