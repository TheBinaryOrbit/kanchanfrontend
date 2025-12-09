"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Bell, Settings, Menu, X } from 'lucide-react'

export default function Topbar() {
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [adminName, setAdminName] = useState('Admin User')

  useEffect(() => {
    // Get admin name from localStorage or API if available
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('adminName')
      if (storedName) setAdminName(storedName)
    }
  }, [])

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
    }
    router.push('/login')
  }

  return (
    <header className="z-40 pb-3 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Logo/Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">A</span>
            </div> */}
            {/* <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
              <p className="text-xs text-slate-500">Management Dashboard</p>
            </div> */}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white">
                <img 
                  src="/assets/icons/admin-icon.svg" 
                  alt="Admin" 
                  className="w-5 h-5 filter brightness-0 invert" 
                />
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-slate-800">{adminName}</div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white">
                      <img 
                        src="/assets/icons/admin-icon.svg" 
                        alt="Admin" 
                        className="w-6 h-6 filter brightness-0 invert" 
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{adminName}</div>
                      <div className="text-xs text-slate-600">admin@example.com</div>
                    </div>
                  </div>
                </div>

                {/* <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700">My Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700">Settings</span>
                  </button>
                </div> */}

                <div className="p-2 border-t border-slate-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {/* {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowProfileMenu(false)
            setShowNotifications(false)
          }}
        ></div>
      )} */}
    </header>
  )
}