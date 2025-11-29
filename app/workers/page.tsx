'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

interface Worker {
  id: string
  name: string
  role: string
  status: string
  created_at: string
}

export default function WorkersPage() {
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<Worker[]>([])
  const router = useRouter()

  useEffect(() => {
    async function loadWorkers() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error loading workers:', error)
      } else {
        setWorkers(data || [])
      }
      setLoading(false)
    }

    loadWorkers()
  }, [router])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Workers</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Worker
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => router.push(`/workers/${worker.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {worker.name}
                    </button>
                  </td>
                  <td className="py-3 px-4">{worker.role}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      worker.status === 'compliant' 
                        ? 'bg-green-100 text-green-800'
                        : worker.status === 'expiring_soon'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => router.push(`/workers/${worker.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
     )
}