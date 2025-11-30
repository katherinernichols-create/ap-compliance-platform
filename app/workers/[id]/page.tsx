'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [worker, setWorker] = useState<any>(null)
  const [credentials, setCredentials] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: w } = await supabase.from('workers').select('*').eq('id', id).single()
      setWorker(w)

      const { data: c } = await supabase
        .from('credentials')
        .select('*, credential_types(name)')
        .eq('worker_id', id)
      
      setCredentials(c || [])
      setLoading(false)
    }
    loadData()
  }, [id, router])

  async function handleCheckCompliance() {
    setAnalyzing(true)
    setAiSummary(null)
    
    try {
      const response = await fetch('/api/analyse-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: id })
      })
      
      const data = await response.json()
      
      if (data.analysis) {
        setAiSummary(data.analysis)
      } else {
        setAiSummary('Error: Unable to analyze compliance')
      }
    } catch (error) {
      console.error('Error:', error)
      setAiSummary('Error: Failed to check compliance')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!worker) return <div className="p-8">Worker not found</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/workers" className="text-blue-600 mb-6 block">← Back to Workers</Link>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{worker.name}</h1>
          <p>Role: {worker.role}</p>
          <p>Email: {worker.email || 'Not provided'}</p>
          <p>Status: {worker.status}</p>
          
          <button
            onClick={handleCheckCompliance}
            disabled={analyzing}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            {analyzing ? 'Analyzing...' : 'Check Compliance'}
          </button>
          
          {aiSummary && (
            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-bold mb-2">AI Compliance Analysis:</h3>
              <p className="whitespace-pre-line">{aiSummary}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Credentials</h2>
          {credentials.length > 0 ? (
            <div>
              {credentials.map((c) => (
                <div key={c.id} className="border-b py-2">
                  <p>Type: {c.credential_types?.name || 'N/A'}</p>
                  <p>Status: {c.status}</p>
                  <p>Issue: {c.issue_date || 'N/A'}</p>
                  <p>Expiry: {c.expiry_date || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No credentials yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
