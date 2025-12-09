import React from 'react'
import Sidebar from './components/Sidebar'
import ClientLayout from './components/ClientLayout'

export const metadata = {
  title: 'Admin - Kanchan',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <ClientLayout>{children}</ClientLayout>
    </div>
  )
}
