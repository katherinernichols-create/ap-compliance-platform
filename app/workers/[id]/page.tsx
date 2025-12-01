'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CREDENTIAL_CHECKLIST = {
  screening: [
    { 
      id: 'police-or-ndis', 
      name: 'Police Check OR NDIS Worker Screening', 
      validity: '3-5 years',
      mutuallyExclusive: true,
      note: 'Worker needs ONE of these',
      mandatory: true
    },
    { 
      id: 'international-criminal-history', 
      name: 'International Criminal History Declaration', 
      validity: 'One-time',
      conditional: 'If worker lived overseas since age 16',
      mandatory: false
    },
    { 
      id: 'working-with-children', 
      name: 'Working with Children Check', 
      validity: 'State/territory specific',
      conditional: 'If working with minors',
      mandatory: false
    },
    { 
      id: 'vulnerable-people', 
      name: 'Working with Vulnerable People Card', 
      validity: '5 years',
      conditional: 'TAS/ACT only',
      mandatory: false
    },
  ],
  qualifications: [
    { 
      id: 'cert-iii', 
      name: 'Certificate III in Individual Support', 
      validity: 'No expiry',
      roleSpecific: 'Care Worker',
      mandatory: true
    },
    { 
      id: 'ahpra', 
      name: 'AHPRA Registration', 
      validity: '12 months',
      roleSpecific: 'Registered Nurse',
      mandatory: true
    },
    { 
      id: 'allied-health', 
      name: 'Professional Registration', 
      validity: 'Varies',
      roleSpecific: 'Allied Health Professional',
      mandatory: true
    },
  ],
  training: [
    { id: 'cpr', name: 'Current CPR Certification', validity: '12 months', mandatory: true },
    { id: 'code-of-conduct', name: 'Code of Conduct Training', validity: '12 months', mandatory: true },
    { id: 'sirs', name: 'SIRS Training', validity: '12 months', mandatory: true },
    { id: 'infection-control', name: 'Infection Control Training', validity: '12 months', mandatory: true },
    { id: 'manual-handling', name: 'Manual Handling Training', validity: '12 months', mandatory: true },
  ],
  coreCompetencies: [
    { id: 'person-centred', name: 'Person-centred, rights-based care training', validity: '12 months', mandatory: true },
    { id: 'culturally-safe', name: 'Culturally safe, trauma-aware care training', validity: '12 months', mandatory: true },
    { id: 'dementia', name: 'Dementia care training', validity: '12 months', mandatory: true },
    { id: 'medical-emergency', name: 'Medical emergency response training', validity: '12 months', mandatory: true },
  ],
}

export default function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [worker, setWorker] = useState<any>(null)
  const [credentials, setCredentials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [overallStatus, setOverallStatus] = useState<'compliant' | 'at-risk' | 'non-compliant'>('non-compliant')
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    fetchWorkerData()
  }, [id])

  async function fetchWorkerData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single()

      if (workerError) throw workerError
      setWorker(workerData)

      const { data: credentialsData, error: credentialsError } = await supabase
        .from('credentials')
        .select(`
          *,
          credential_types (
            name,
            category
          )
        `)
        .eq('worker_id', id)

      if (credentialsError) throw credentialsError
      setCredentials(credentialsData || [])

      calculateOverallStatus(credentialsData || [])
    } catch (error) {
      console.error('Error fetching worker:', error)
      alert('Failed to load worker details')
    } finally {
      setLoading(false)
    }
  }

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

  function calculateOverallStatus(creds: any[]) {
    const hasExpired = creds.some(c => c.status === 'expired')
    const hasExpiring = creds.some(c => c.status === 'expiring')
    
    const totalMandatory = 11
    const uploadedCount = creds.length

    if (hasExpired || uploadedCount < totalMandatory) {
      setOverallStatus('non-compliant')
    } else if (hasExpiring) {
      setOverallStatus('at-risk')
    } else {
      setOverallStatus('compliant')
    }
  }

  function getStatusBadge(status: string) {
    const badges: Record<string, { text: string; bgClass: string; textClass: string; squareClass: string; borderClass: string }> = {
      'valid': { 
        text: 'Valid', 
        bgClass: 'bg-green-100', 
        textClass: 'text-green-800', 
        squareClass: 'bg-green-600',
        borderClass: 'border-green-700'
      },
      'expiring': { 
        text: 'Expiring Soon', 
        bgClass: 'bg-amber-100', 
        textClass: 'text-amber-800', 
        squareClass: 'bg-amber-500',
        borderClass: 'border-amber-600'
      },
      'expired': { 
        text: 'Expired', 
        bgClass: 'bg-red-100', 
        textClass: 'text-red-800', 
        squareClass: 'bg-red-600',
        borderClass: 'border-red-700'
      },
      'missing': { 
        text: 'Not Uploaded', 
        bgClass: 'bg-gray-100', 
        textClass: 'text-gray-700', 
        squareClass: 'bg-white',
        borderClass: 'border-gray-400'
      },
    }
    return badges[status] || badges.missing
  }

  function getOverallStatusBadge() {
    const badges: Record<string, { text: string; bgClass: string; textClass: string }> = {
      'compliant': { text: 'Fully Compliant', bgClass: 'bg-green-600', textClass: 'text-white' },
      'at-risk': { text: 'Action Needed', bgClass: 'bg-amber-500', textClass: 'text-white' },
      'non-compliant': { text: 'Non-Compliant', bgClass: 'bg-red-600', textClass: 'text-white' },
    }
    return badges[overallStatus]
  }

  function hasCredential(credentialId: string): any | null {
    const nameMap: Record<string, string | string[]> = {
      'police-or-ndis': ['National Police Check', 'NDIS Worker Screening Check'],
      'international-criminal-history': 'International Criminal History Declaration',
      'working-with-children': 'Working with Children Check',
      'vulnerable-people': 'Working with Vulnerable People Card',
      'cert-iii': 'Certificate III in Individual Support',
      'ahpra': 'AHPRA Registration',
      'allied-health': 'Professional Registration',
      'cpr': 'Current CPR Certification',
      'code-of-conduct': 'Code of Conduct Training',
      'sirs': 'SIRS Training',
      'infection-control': 'Infection Control Training',
      'manual-handling': 'Manual Handling Training',
      'person-centred': 'Person-centred Care Training',
      'culturally-safe': 'Culturally Safe Care Training',
      'dementia': 'Dementia Care Training',
      'medical-emergency': 'Medical Emergency Response Training',
    }

    const lookupNames = nameMap[credentialId]
    
    if (Array.isArray(lookupNames)) {
      return credentials.find(c => lookupNames.includes(c.credential_types?.name)) || null
    } else if (lookupNames) {
      return credentials.find(c => c.credential_types?.name === lookupNames) || null
    }
    
    return null
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'No expiry'
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  async function handleViewEvidence(filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from('worker-credentials')
        .createSignedUrl(filePath, 3600)

      if (error) throw error
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error viewing evidence:', error)
      alert('Failed to load document')
    }
  }

  function getCategoryForItem(itemId: string): string {
    for (const [category, items] of Object.entries(CREDENTIAL_CHECKLIST)) {
      if (items.some((item: any) => item.id === itemId)) {
        return category
      }
    }
    return 'unknown'
  }

  function shouldShowItem(item: any, categoryName: string): boolean {
    const credential = hasCredential(item.id)
    const status = credential ? credential.status : 'missing'
    
    // Filter by status
    if (filterStatus !== 'all' && status !== filterStatus) return false
    
    // Filter by category
    if (filterCategory !== 'all' && categoryName !== filterCategory) return false
    
    // Filter by search term
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    
    return true
  }

  function renderCredentialItem(item: any, category: string) {
    const credential = hasCredential(item.id)
    const status = credential ? credential.status : 'missing'
    const badge = getStatusBadge(status)
    
    // Check if should show based on filters
    if (!shouldShowItem(item, category)) return null
    
    // Only show status for mandatory items or if credential exists
    const showStatus = item.mandatory !== false || credential

    return (
      <div key={item.id} className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-all bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {/* Colored square status indicator */}
              <div className={`w-5 h-5 mt-0.5 rounded border-2 ${badge.squareClass} ${badge.borderClass} flex-shrink-0`}></div>
              <div className="flex-1">
                <h4 className="font-semibold text-kora-deep-teal text-base">{item.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Validity: {item.validity}
                  {item.conditional && ` • ${item.conditional}`}
                  {item.roleSpecific && ` • Required for ${item.roleSpecific}`}
                  {item.note && ` • ${item.note}`}
                </p>
              </div>
            </div>
            
            {credential && (
              <div className="mt-3 ml-8 text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Issued:</span> {formatDate(credential.issue_date)}</p>
                <p><span className="font-medium">Expires:</span> {formatDate(credential.expiry_date)}</p>
                {credential.document_url && (
                  <button 
                    onClick={() => handleViewEvidence(credential.document_url)}
                    className="text-kora-teal hover:text-kora-mid-teal font-semibold mt-2 inline-block text-sm underline"
                  >
                    View Evidence
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {showStatus && (
              <span className={`px-4 py-2 rounded-md text-sm font-bold ${badge.bgClass} ${badge.textClass} min-w-[130px] text-center border-2 ${badge.borderClass}`}>
                {badge.text}
              </span>
            )}
            {!credential && item.mandatory !== false && (
              <button 
                className="px-4 py-2 bg-[#FF8585] text-white rounded-md text-sm font-semibold hover:bg-[#FF6B6B] transition-all shadow-md"
                onClick={() => router.push(`/workers/${id}/credentials/new`)}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="p-8 text-center">Loading worker details...</div>
  }

  if (!worker) {
    return <div className="p-8 text-center">Worker not found</div>
  }

  const overallBadge = getOverallStatusBadge()
  const missingCount = Object.values(CREDENTIAL_CHECKLIST)
    .flat()
    .filter(item => item.mandatory !== false && !hasCredential(item.id)).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <Link 
          href="/workers"
          className="text-kora-teal hover:text-kora-mid-teal mb-4 flex items-center gap-1 font-semibold text-base"
        >
          ← Back to Workers
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-kora-teal">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-kora-deep-teal mb-2">{worker.name}</h1>
              <p className="text-base text-gray-700"><span className="font-semibold">Role:</span> {worker.role}</p>
              {worker.email && <p className="text-base text-gray-700"><span className="font-semibold">Email:</span> {worker.email}</p>}
              {worker.phone && <p className="text-base text-gray-700"><span className="font-semibold">Phone:</span> {worker.phone}</p>}
            </div>
            
            <div className="text-right">
              <div className={`inline-block px-6 py-3 rounded-md ${overallBadge.bgClass} ${overallBadge.textClass} shadow-md`}>
                <span className="font-bold text-base">{overallBadge.text}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-base text-gray-700 font-medium">
              {credentials.length} of {credentials.length + missingCount} credentials uploaded
              {missingCount > 0 && <span className="text-red-600 font-bold"> • {missingCount} missing</span>}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <button 
              onClick={() => router.push(`/workers/${id}/credentials/new`)}
              className="px-6 py-3 bg-[#FF8585] text-white rounded-md hover:bg-[#FF6B6B] shadow-md font-semibold transition-all"
            >
              + Add Credential
            </button>
            <button 
              onClick={handleCheckCompliance}
              disabled={analyzing}
              className="px-6 py-3 bg-[#4D9B91] text-white rounded-md hover:bg-[#3D8B81] font-semibold disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md"
            >
              {analyzing ? 'Analyzing...' : 'Check Compliance'}
            </button>
            <button className="px-6 py-3 bg-white text-kora-deep-teal border-2 border-kora-teal rounded-md hover:bg-kora-teal/10 font-semibold transition-all shadow-sm">
              Share with RP
            </button>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-kora-deep-teal mb-3">Filter Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
                >
                  <option value="all">All Statuses</option>
                  <option value="valid">Valid</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                  <option value="missing">Not Uploaded</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
                >
                  <option value="all">All Categories</option>
                  <option value="screening">Screening</option>
                  <option value="qualifications">Qualifications</option>
                  <option value="training">Training</option>
                  <option value="coreCompetencies">Core Competencies</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <input 
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
                />
              </div>
            </div>
            
            {(filterStatus !== 'all' || filterCategory !== 'all' || searchTerm) && (
              <button 
                onClick={() => {
                  setFilterStatus('all')
                  setFilterCategory('all')
                  setSearchTerm('')
                }}
                className="mt-3 text-xs text-kora-teal hover:text-kora-mid-teal font-semibold"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {aiSummary && (
            <div className="mt-4 p-4 bg-teal-50 rounded-md border-2 border-kora-teal">
              <h3 className="font-bold mb-2 text-kora-deep-teal text-base">Compliance Analysis:</h3>
              <p className="whitespace-pre-line text-sm text-kora-deep-teal leading-relaxed">{aiSummary}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* SCREENING SECTION */}
          {CREDENTIAL_CHECKLIST.screening.some(item => shouldShowItem(item, 'screening')) && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81] px-6 py-3">
                <h2 className="text-lg font-bold text-white">
                  SCREENING (Mandatory for All)
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {CREDENTIAL_CHECKLIST.screening.map(item => renderCredentialItem(item, 'screening'))}
              </div>
            </div>
          )}

          {/* QUALIFICATIONS SECTION */}
          {CREDENTIAL_CHECKLIST.qualifications
            .filter(item => !item.roleSpecific || item.roleSpecific === worker.role)
            .some(item => shouldShowItem(item, 'qualifications')) && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81] px-6 py-3">
                <h2 className="text-lg font-bold text-white">
                  QUALIFICATIONS (Role-Specific)
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {CREDENTIAL_CHECKLIST.qualifications
                  .filter(item => !item.roleSpecific || item.roleSpecific === worker.role)
                  .map(item => renderCredentialItem(item, 'qualifications'))}
              </div>
            </div>
          )}

          {/* TRAINING SECTION */}
          {CREDENTIAL_CHECKLIST.training.some(item => shouldShowItem(item, 'training')) && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81] px-6 py-3">
                <h2 className="text-lg font-bold text-white">
                  MANDATORY TRAINING (All Roles)
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {CREDENTIAL_CHECKLIST.training.map(item => renderCredentialItem(item, 'training'))}
              </div>
            </div>
          )}

          {/* CORE COMPETENCIES SECTION */}
          {CREDENTIAL_CHECKLIST.coreCompetencies.some(item => shouldShowItem(item, 'coreCompetencies')) && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#4D9B91] to-[#3D8B81] px-6 py-3">
                <h2 className="text-lg font-bold text-white">
                  CORE COMPETENCIES (Quality Standard 2.9.6)
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {CREDENTIAL_CHECKLIST.coreCompetencies.map(item => renderCredentialItem(item, 'coreCompetencies'))}
              </div>
            </div>
          )}
        </div>

        {credentials.length === 0 && (
          <div className="mt-6 bg-teal-50 border-2 border-kora-teal rounded-md p-6 text-center">
            <p className="text-kora-deep-teal font-medium">
              No credentials uploaded yet. Add {worker.name}'s first credential to begin tracking compliance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
