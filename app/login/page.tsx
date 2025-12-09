"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import img from '@/app/assets/Icons.jpg'
import { Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await import('../../lib/api').then(m => m.login(uid, password))
      // store token and go to admin dashboard
      localStorage.setItem('adminToken', data.token || data.user?.id || '')
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-8 py-8 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-4 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>

            {/* Logo */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 mb-4 relative group">
                {/* <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div> */}
                {/* <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/30"> */}
                <img
                  src={img.src}
                  alt="Kanchan Logo"
                  className="w-full h-full object-contain filter drop-shadow-2xl rounded-2xl"
                />
                {/* </div> */}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Welcome Back</h1>
                <p className="text-blue-100 text-sm font-medium">Sign in to Kanchan Portal</p>
                <div className="w-12 h-0.5 bg-white/30 mx-auto rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 bg-gradient-to-b from-white to-gray-50">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3 animate-shake">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/UID Field */}
              <div className="space-y-2">
                <label htmlFor="uid" className="block text-sm font-semibold text-slate-700">
                  Email / User ID
                </label>
                <div className="group flex items-center relative border-2 border-slate-400 rounded-2xl px-3">
                  <Mail className="w-5 h-5 text-slate-400 transition-colors" />
                  <input
                    id="uid"
                    type="text"
                    required
                    value={uid}
                    onChange={e => setUid(e.target.value)}
                    className="w-full pl-2 py-3.5 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-0 focus:border-none placeholder-slate-400"
                    placeholder="Enter your email or user ID"
                  />

                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="group flex items-center relative border-2 border-slate-400 rounded-2xl px-3">
                  <Lock className="w-5 h-5 text-slate-400 transition-colors" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-2 py-3.5 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-0 focus:border-none placeholder-slate-400"
                    placeholder="Enter your password"
                  />
                </div>
              </div>


              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !uid || !password}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 group-hover:animate-pulse"></div>

                  {loading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Sign In</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-center space-y-3">

                <p className="text-xs text-slate-400">
                  © 2025 Kanchan Management System. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        {/* <div className="mt-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-white/80 text-sm mb-2 font-medium">Need assistance?</p>
              <p className="text-white/60 text-xs">Contact your system administrator for help</p>
            </div>
          </div> */}
      </div>
    </div>
  )
}
