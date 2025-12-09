"use client"
import React, { useState } from 'react'
import api from '@/lib/api'

export default function CreateMachine() {
  const [form, setForm] = useState({ name: '', category: '', brand: '', warrantyTimeInMonths: '12', serialNumber: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await api.post('/api/machines', {
        name: form.name,
        category: form.category,
        brand: form.brand,
        warrantyTimeInMonths: Number(form.warrantyTimeInMonths),
        serialNumber: form.serialNumber,
      })
      const json = res.data
      if (res.status === 201 || res.status === 200) {
        alert('Machine added')
        window.location.href = '/admin/machines'
      } else alert(json.message || 'Error')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error creating machine')
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Add Machine</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded space-y-2">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Warranty months" value={form.warrantyTimeInMonths} onChange={e => setForm({ ...form, warrantyTimeInMonths: e.target.value })} className="p-2 border w-full" />
        <input placeholder="Serial Number" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} className="p-2 border w-full" />
        <div>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
        </div>
      </form>
    </div>
  )
}
