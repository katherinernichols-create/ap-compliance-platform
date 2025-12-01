'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WorkersPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    fetchWorkers()
  }, [])

  async function fetchWorkers() {
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
        alert('Profile not found')
        return
      }

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('organisation_id', profile.organisation_id)
        .order('name')

      if (error) throw error
      setWorkers(data || [])
    } catch (error) {
      console.error('Error fetching workers:', error)
      alert('Failed to load workers')
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || worker.role === filterRole
    return matchesSearch && matchesRole
  })

  const roles = [...new Set(workers.map(w => w.role))]

  if (loading) {
    return <div className="p-8 text-center">Loading workers...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-kora-deep-teal">Workers</h1>
          <Link 
            href="/workers/new"
            className="px-6 py-3 bg-[#FF8585] text-white rounded-md hover:bg-[#FF6B6B] shadow-md font-semibold transition-all"
          >
            Add Worker
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-kora-deep-teal mb-3">Filter Workers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(searchTerm || filterRole !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterRole('all')
              }}
              className="mt-3 text-xs text-kora-teal hover:text-kora-mid-teal font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Workers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || filterRole !== 'all' 
                        ? 'No workers match your filters' 
                        : 'No workers yet. Add your first worker to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-kora-deep-teal">{worker.name}</p>
                          {worker.email && (
                            <p className="text-sm text-gray-600">{worker.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{worker.role}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold border border-green-300">
                          {worker.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/workers/${worker.id}`}
                          className="text-kora-teal hover:text-kora-mid-teal font-semibold text-sm underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {workers.length > 0 && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredWorkers.length} of {workers.length} workers
          </p>
        )}
      </div>
    </div>
  )
}
