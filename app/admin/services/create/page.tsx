"use client"
import React, { useState } from 'react'
import api from '@/lib/api'

export default function CreateServicePage() {
  const [form, setForm] = useState({ customerId: '', machineId: '', purchaseDate: '', warrantyExpiresAt: '', pendingAmount: '0' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await api.post('/api/service-records', {
        customerId: form.customerId,
        machineId: form.machineId,
        purchaseDate: form.purchaseDate,
        warrantyExpiresAt: form.warrantyExpiresAt,
        pendingAmount: Number(form.pendingAmount),
      })
      if (res.status >= 200 && res.status < 300) {
        alert('Created')
        window.location.href = '/admin/services'
      } else {
        alert(res.data?.message || 'Error')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Create Service Record</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded space-y-2">
        <input placeholder="Customer ID" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Machine ID" value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Purchase Date (ISO)" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Warranty Expires At (ISO)" value={form.warrantyExpiresAt} onChange={e => setForm({ ...form, warrantyExpiresAt: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Pending Amount" value={form.pendingAmount} onChange={e => setForm({ ...form, pendingAmount: e.target.value })} className="p-2 border w-full" />
        <div>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
        </div>
      </form>
    </div>
  )
}
