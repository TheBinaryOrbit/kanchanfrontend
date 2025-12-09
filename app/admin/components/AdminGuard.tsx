"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
      if (!token) {
        router.replace('/login')
      } else {
        setChecked(true)
      }
    } catch (err) {
      router.replace('/login')
    }
  }, [router])

  if (!checked) return <div className="p-6">Checking authentication...</div>

  return <>{children}</>
}
