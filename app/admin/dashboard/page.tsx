"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Users, Activity, UserCheck, AlertCircle, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

type DashboardData = {
  role?: string
  totalUsers?: number
  activeServices?: number
  totalCustomers?: number
  openIssues?: number,
  totalMachines?: number
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/users/dashboard?role=ADMIN')
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const stats = [
    {
      title: 'Total Users',
      value: data?.totalUsers ?? 0,
      change: '+12%',
      trending: 'up',
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      routerLink: '/admin/users'
    },
    {
      title: 'Active Services',
      value: data?.activeServices ?? 0,
      change: '+8%',
      trending: 'up',
      icon: Activity,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      routerLink: '/admin/services'
    },
    {
      title: 'Total Customers',
      value: data?.totalCustomers ?? 0,
      change: '+23%',
      trending: 'up',
      icon: UserCheck,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      routerLink: '/admin/customers'
    },
    {
      title: 'Open Issues',
      value: data?.openIssues ?? 0,
      change: '-5%',
      trending: 'down',
      icon: AlertCircle,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      routerLink: '/admin/issues'
    },
    {
      title: 'Total Machines',
      value: data?.totalMachines ?? 0,
      change: '-5%',
      trending: 'down',
      icon: AlertCircle,
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      routerLink: '/admin/machines  '
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
        </div>

        {data ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                const TrendIcon = stat.trending === 'up' ? TrendingUp : TrendingDown
                
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-100"
                    onClick={() => router.push(stat.routerLink)}
                  >
                    <div className="p-6">
                      {/* Icon and Trend */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                      </div>

                      {/* Value */}
                      <div className="mb-2">
                        <h3 className="text-3xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {stat.value.toLocaleString()}
                        </h3>
                      </div>

                      {/* Title */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <div className={`h-1 bg-gradient-to-r ${stat.bgGradient}`}></div>
                  </div>
                )
              })}
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all group" onClick={()=> router.push('/admin/customers')}>
                    <span className="font-medium text-slate-800">Add New Customer</span>
                    <ArrowUpRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all group" onClick={()=> router.push('/admin/services')}>
                    <span className="font-medium text-slate-800">Create Service Record</span>
                    <ArrowUpRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all group" onClick={()=> router.push('/admin/users')}>
                    <span className="font-medium text-slate-800">Manage Employees</span>
                    <ArrowUpRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 rounded-xl transition-all group" onClick={()=> router.push('/admin/machines')}>
                    <span className="font-medium text-slate-800">Manage Machines</span>
                    <ArrowUpRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              {/* <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">New customer registered</p>
                      <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Service completed</p>
                      <p className="text-xs text-slate-500 mt-1">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Issue reported</p>
                      <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">New user added</p>
                      <p className="text-xs text-slate-500 mt-1">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Dashboard Data</h3>
            <p className="text-slate-600">Unable to load dashboard statistics at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
