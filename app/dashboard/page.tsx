'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [workerCount, setWorkerCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
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

      if (profile) {
        const { data: org } = await supabase
          .from('organisations')
          .select('name')
          .eq('id', profile.organisation_id)
          .single()

        if (org) setOrgName(org.name)

        const { count } = await supabase
          .from('workers')
          .select('*', { count: 'exact', head: true })
          .eq('organisation_id', profile.organisation_id)

        setWorkerCount(count || 0)
      }

      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{orgName}</h1>
          <p className="text-gray-600 mb-8">Worker Compliance Dashboard</p>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Workers</p>
                <p className="text-3xl font-bold text-blue-600">{workerCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-600">Non-Compliant</p>
                <p className="text-3xl font-bold text-red-600">0</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
            <button
              onClick={() => router.push('/workers/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Worker
            </button>
          </div>

          {workerCount === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No workers added yet.</p>
              <p className="text-sm text-gray-500">Click Add Worker to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Worker list will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
