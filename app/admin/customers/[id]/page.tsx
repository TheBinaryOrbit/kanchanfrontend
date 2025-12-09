"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

export default function CustomerDetails() {
  const params = useParams()
  const id = (params as any)?.id
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get(`/api/customers/${id}`)
        setCustomer(res.data.customer || res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

  const addressParts = (customer.address || '').split('|').map((s: string) => s.trim())
  const [street = '', city = '', state = '', pincode = ''] = addressParts

  return (
    <div>
      <h1 className="text-2xl mb-2">{customer.name}</h1>
      <div className="bg-white p-4 rounded shadow">
        <div>Email: {customer.email}</div>
        <div>Phone: {customer.phone}</div>
        <div className="mt-2 font-medium">Address</div>
        <div>Street: {street}</div>
        <div>City: {city}</div>
        <div>State: {state}</div>
        <div>Pincode: {pincode}</div>
        <div className="mt-3">Created At: {customer.createdAt}</div>
      </div>
    </div>
  )
}
