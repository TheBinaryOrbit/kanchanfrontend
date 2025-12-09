"use client"
import React from 'react'
import AdminGuard from './AdminGuard'
import Topbar from './Topbar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex-1 min-h-screen">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </AdminGuard>
  )
}
