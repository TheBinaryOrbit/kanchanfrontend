"use client"
import React, { useState } from 'react'
import api from '@/lib/api'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put('/api/users/change-password', {
        currentPassword,
        newPassword
      })
      alert(response.data.message || 'Password changed successfully')
      window.location.href = '/admin'
    } catch (err: any) {
      console.error('Failed to change password:', err)
      alert(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Change Password</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded space-y-2">
        <input placeholder="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="p-2 border w-full" />
        <input placeholder="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="p-2 border w-full" />
        <div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
