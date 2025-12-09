"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Wrench, Cpu, UserCog, ChevronRight } from 'lucide-react'
import img from '@/app/assets/Icons.jpg'
export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & analytics'
    },
    {
      href: '/admin/customers',
      label: 'Customers',
      icon: Users,
      description: 'Manage customers'
    },
    {
      href: '/admin/services',
      label: 'Service Records',
      icon: Wrench,
      description: 'Track services'
    },
    {
      href: '/admin/machines',
      label: 'Machines',
      icon: Cpu,
      description: 'Machine inventory'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: UserCog,
      description: 'User management'
    }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {/* <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20"> */}
            <img 
              src={img.src}
              alt="Kanchan Logo" 
              className="w-12 h-12 object-contain rounded-xl"
            />
          {/* </div> */}
          <div>
            <h1 className="text-white font-bold text-xl">Kanchan Portal</h1>
            <p className="text-slate-400 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-3 px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all
                    ${active 
                      ? 'bg-white/10' 
                      : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`
                      text-xs transition-colors
                      ${active ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}
                    `}>
                      {item.description}
                    </div>
                  </div>
                  
                  {active && (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      

      {/* Version Info */}
      <div className="px-6 py-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Version 1.0.0</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
  )
}