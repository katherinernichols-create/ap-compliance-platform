'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [stats, setStats] = useState({
    totalWorkers: 0,
    compliantWorkers: 0,
    atRiskWorkers: 0,
    nonCompliantWorkers: 0,
    totalCredentials: 0,
    expiringSoon: 0,
    expired: 0,
    recentUploads: [] as any[]
  })
  const [workers, setWorkers] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organisation_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organisation_id) {
        setLoading(false)
        return
      }

      // Get organisation name
      const { data: org } = await supabase
        .from('organisations')
        .select('name')
        .eq('id', profile.organisation_id)
        .single()

      if (org) setOrgName(org.name)

      // Fetch workers
      const { data: workersData, error: workersError } = await supabase
        .from('workers')
        .select('*')
        .eq('organisation_id', profile.organisation_id)

      if (workersError) throw workersError

      // Fetch all credentials
      const { data: credentialsData, error: credentialsError } = await supabase
        .from('credentials')
        .select(`
          *,
          workers (name, role)
        `)
        .order('created_at', { ascending: false })

      if (credentialsError) throw credentialsError

      // Calculate stats
      const totalWorkers = workersData?.length || 0
      const totalCredentials = credentialsData?.length || 0
      const expiringSoon = credentialsData?.filter(c => c.status === 'expiring').length || 0
      const expired = credentialsData?.filter(c => c.status === 'expired').length || 0
      const recentUploads = credentialsData?.slice(0, 5) || []

      // Calculate worker compliance
      let compliantWorkers = 0
      let atRiskWorkers = 0
      let nonCompliantWorkers = 0

      workersData?.forEach(worker => {
        const workerCreds = credentialsData?.filter(c => c.worker_id === worker.id) || []
        const hasExpired = workerCreds.some(c => c.status === 'expired')
        const hasExpiring = workerCreds.some(c => c.status === 'expiring')
        
        // Basic compliance check (you can refine this logic)
        if (workerCreds.length >= 8 && !hasExpired) {
          compliantWorkers++
        } else if (hasExpiring && !hasExpired) {
          atRiskWorkers++
        } else {
          nonCompliantWorkers++
        }
      })

      setStats({
        totalWorkers,
        compliantWorkers,
        atRiskWorkers,
        nonCompliantWorkers,
        totalCredentials,
        expiringSoon,
        expired,
        recentUploads
      })

      setWorkers(workersData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const complianceRate = stats.totalWorkers > 0 
    ? Math.round((stats.compliantWorkers / stats.totalWorkers) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-kora-deep-teal mb-2">{orgName}</h1>
          <p className="text-gray-600">Worker Compliance Dashboard</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Workers */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-kora-teal">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Workers</p>
            <p className="text-3xl font-bold text-kora-deep-teal">{stats.totalWorkers}</p>
            <Link href="/workers" className="text-xs text-kora-teal hover:text-kora-mid-teal font-semibold mt-3 block">
              View all →
            </Link>
          </div>

          {/* Compliant Workers */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Compliant</p>
            <p className="text-3xl font-bold text-green-700">{stats.compliantWorkers}</p>
            <p className="text-xs text-gray-600 mt-3">{complianceRate}% compliance rate</p>
          </div>

          {/* At Risk */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <p className="text-sm font-medium text-gray-600 mb-1">At Risk</p>
            <p className="text-3xl font-bold text-amber-700">{stats.atRiskWorkers}</p>
            <p className="text-xs text-gray-600 mt-3">Credentials expiring soon</p>
          </div>

          {/* Non-Compliant */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Non-Compliant</p>
            <p className="text-3xl font-bold text-red-700">{stats.nonCompliantWorkers}</p>
            <p className="text-xs text-gray-600 mt-3">Requires immediate action</p>
          </div>
        </div>

        {/* Action Required Section */}
        {(stats.expiringSoon > 0 || stats.expired > 0) && (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-2">⚠️ Action Required</h2>
            <p className="text-amber-800">
              {stats.expired > 0 && <span className="font-semibold">{stats.expired} credentials have expired</span>}
              {stats.expired > 0 && stats.expiringSoon > 0 && <span> and </span>}
              {stats.expiringSoon > 0 && <span className="font-semibold">{stats.expiringSoon} credentials are expiring soon</span>}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workers List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Workers</h2>
              <button
                onClick={() => router.push('/workers/new')}
                className="px-4 py-2 bg-[#FF8585] text-white rounded-md hover:bg-[#FF6B6B] shadow-md font-semibold text-sm transition-all"
              >
                Add Worker
              </button>
            </div>
            <div className="p-6">
              {stats.totalWorkers === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">No workers added yet.</p>
                  <p className="text-sm text-gray-500">Click Add Worker to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workers.slice(0, 5).map(worker => (
                    <Link
                      key={worker.id}
                      href={`/workers/${worker.id}`}
                      className="block p-3 border border-gray-200 rounded-md hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-kora-deep-teal">{worker.name}</p>
                          <p className="text-sm text-gray-600">{worker.role}</p>
                        </div>
                        <span className="text-kora-teal font-semibold text-sm">View →</span>
                      </div>
                    </Link>
                  ))}
                  
                  {workers.length > 5 && (
                    <Link
                      href="/workers"
                      className="block text-center mt-4 text-kora-teal hover:text-kora-mid-teal font-semibold text-sm"
                    >
                      View all {stats.totalWorkers} workers →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81] px-6 py-4">
              <h2 className="text-lg font-bold text-white">Recent Credential Uploads</h2>
            </div>
            <div className="p-6">
              {stats.recentUploads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No credentials uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentUploads.map(cred => (
                    <div
                      key={cred.id}
                      className="p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-kora-deep-teal text-sm">
                            {cred.workers?.name || 'Unknown Worker'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {cred.workers?.role || 'Unknown Role'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          cred.status === 'valid' ? 'bg-green-100 text-green-800 border border-green-300' :
                          cred.status === 'expiring' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {cred.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 border-l-4 border-[#FF8585]">
          <h2 className="text-lg font-bold text-kora-deep-teal mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/workers/new')}
              className="px-6 py-3 bg-[#FF8585] text-white rounded-md hover:bg-[#FF6B6B] shadow-md font-semibold transition-all"
            >
              + Add Worker
            </button>
            <button
              onClick={() => router.push('/workers')}
              className="px-6 py-3 bg-[#4D9B91] text-white rounded-md hover:bg-[#3D8B81] shadow-md font-semibold transition-all"
            >
              View All Workers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
