'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const WORKER_ROLES = [
  'Care Worker',
  'Registered Nurse',
  'Allied Health Professional',
  'Support Coordinator',
  'Team Leader',
  'Manager'
]

export default function NewWorkerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'active'
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in')
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

      const { error } = await supabase
        .from('workers')
        .insert([{
          ...formData,
          organisation_id: profile.organisation_id
        }])

      if (error) throw error

      router.push('/workers')
    } catch (error: any) {
      console.error('Error creating worker:', error)
      alert(`Failed to create worker: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/workers" 
          className="text-kora-teal hover:text-kora-mid-teal mb-6 block font-semibold"
        >
          ← Back to Workers
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-kora-teal">
          <h1 className="text-2xl font-bold text-kora-deep-teal mb-6">Add New Worker</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-kora-deep-teal">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal text-base"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-kora-deep-teal">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal text-base"
                placeholder="john.smith@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-kora-deep-teal">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal text-base"
                placeholder="0400 000 000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-kora-deep-teal">
                Role <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal text-base"
              >
                <option value="">Select role...</option>
                {WORKER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                Role determines which credentials are mandatory for this worker
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-kora-deep-teal">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal text-base"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#FF8585] text-white rounded-md hover:bg-[#FF6B6B] shadow-md font-semibold disabled:bg-gray-300 disabled:text-gray-500 transition-all"
              >
                {loading ? 'Creating...' : 'Create Worker'}
              </button>
              <Link
                href="/workers"
                className="px-6 py-3 bg-white text-kora-deep-teal border-2 border-kora-teal rounded-md hover:bg-kora-teal/10 font-semibold transition-all shadow-sm inline-block text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-teal-50 rounded-md border-2 border-kora-teal">
            <p className="text-sm text-kora-deep-teal">
              <strong>Next Steps:</strong> After creating the worker, you'll be able to upload their credentials and track compliance status.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
