'use client'

import { useState, use, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CREDENTIAL_TYPES = [
  { id: 'national-police-check', name: 'National Police Check', category: 'Screening', validity: '3 years' },
  { id: 'ndis-worker-screening', name: 'NDIS Worker Screening Check', category: 'Screening', validity: '5 years', mutuallyExclusive: 'police' },
  { id: 'working-with-children', name: 'Working with Children Check', category: 'Screening', validity: '5 years' },
  { id: 'vulnerable-people-card', name: 'Working with Vulnerable People Card', category: 'Screening', validity: '3 years' },
  { id: 'international-criminal', name: 'International Criminal History Declaration', category: 'Screening', validity: 'One-time' },
  { id: 'cert-iii', name: 'Certificate III in Individual Support', category: 'Qualification', validity: 'Permanent' },
  { id: 'ahpra', name: 'AHPRA Registration', category: 'Qualification', validity: '12 months' },
  { id: 'allied-health-registration', name: 'Professional Registration', category: 'Qualification', validity: 'Varies' },
  { id: 'cpr', name: 'Current CPR Certification', category: 'Training', validity: '12 months' },
  { id: 'manual-handling', name: 'Manual Handling Training', category: 'Training', validity: '12 months' },
  { id: 'infection-control', name: 'Infection Control Training', category: 'Training', validity: '12 months' },
  { id: 'code-of-conduct', name: 'Code of Conduct Training', category: 'Training', validity: '12 months' },
  { id: 'sirs', name: 'SIRS Training', category: 'Training', validity: '12 months' },
  { id: 'person-centred', name: 'Person-centred Care Training', category: 'Training', validity: '12 months' },
  { id: 'culturally-safe', name: 'Culturally Safe Care Training', category: 'Training', validity: '12 months' },
  { id: 'dementia', name: 'Dementia Care Training', category: 'Training', validity: '12 months' },
  { id: 'medical-emergency', name: 'Medical Emergency Response Training', category: 'Training', validity: '12 months' },
]

export default function NewCredentialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workerId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [worker, setWorker] = useState<any>(null)
  const [formData, setFormData] = useState({
    credentialType: '',
    issueDate: '',
    expiryDate: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchWorker()
  }, [workerId])

  async function fetchWorker() {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', workerId)
        .single()

      if (error) throw error
      setWorker(data)
    } catch (error) {
      console.error('Error fetching worker:', error)
      alert('Failed to load worker')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF, JPG, or PNG file')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
  }

  function calculateStatus(expiryDate: string | null): string {
    if (!expiryDate) return 'valid'

    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return 'expired'
    if (daysUntilExpiry <= 90) return 'expiring'
    return 'valid'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!file) {
      alert('Please select a file to upload')
      return
    }

    setLoading(true)
    setUploading(true)

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

      const credTypeName = CREDENTIAL_TYPES.find(ct => ct.id === formData.credentialType)?.name
      
      if (!credTypeName) {
        alert('Please select a credential type')
        return
      }

      const { data: credTypeData, error: credTypeError } = await supabase
        .from('credential_types')
        .select('id')
        .eq('name', credTypeName)
        .limit(1)
        .single()

      if (credTypeError || !credTypeData) {
        console.error('Credential type lookup error:', credTypeError)
        alert(`Credential type "${credTypeName}" not found in database. Please contact support.`)
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${formData.credentialType}.${fileExt}`
      const filePath = `${profile.organisation_id}/${workerId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('worker-credentials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress(100)

      const status = calculateStatus(formData.expiryDate || null)

      const { error: insertError } = await supabase
        .from('credentials')
        .insert([{
          worker_id: workerId,
          credential_type_id: credTypeData.id,
          issue_date: formData.issueDate,
          expiry_date: formData.expiryDate || null,
          document_url: filePath,
          status: status,
        }])

      if (insertError) throw insertError

      router.push(`/workers/${workerId}?upload=success&status=${status}`)
    } catch (error: any) {
      console.error('Error uploading credential:', error)
      alert(`Failed to upload credential: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const selectedCredType = CREDENTIAL_TYPES.find(ct => ct.id === formData.credentialType)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href={`/workers/${workerId}`} 
          className="text-kora-teal hover:text-kora-mid-teal mb-6 block font-medium"
        >
          ← Back to Worker
        </Link>

        <div className="bg-white rounded-kora-lg shadow-kora-md p-6">
          <h1 className="text-xl font-bold text-kora-deep-teal mb-2">Add Credential</h1>
          {worker && (
            <p className="text-sm text-gray-600 mb-6">
              Adding credential for <strong>{worker.name}</strong> ({worker.role})
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-kora-deep-teal">
                Credential Type <span className="text-kora-error">*</span>
              </label>
              <select
                required
                value={formData.credentialType}
                onChange={(e) => setFormData({ ...formData, credentialType: e.target.value })}
                className="w-full border border-kora-grey rounded-kora-md px-3 py-2 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
              >
                <option value="">Select credential type...</option>
                <optgroup label="Screening & Clearances">
                  {CREDENTIAL_TYPES.filter(ct => ct.category === 'Screening').map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} ({ct.validity})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Qualifications">
                  {CREDENTIAL_TYPES.filter(ct => ct.category === 'Qualification').map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} ({ct.validity})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Training Records">
                  {CREDENTIAL_TYPES.filter(ct => ct.category === 'Training').map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} ({ct.validity})
                    </option>
                  ))}
                </optgroup>
              </select>
              {selectedCredType?.mutuallyExclusive && (
                <p className="text-xs text-kora-coral mt-1">
                  ⚠️ Alternative to Police Check - worker needs ONE screening credential
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-kora-deep-teal">
                Issue Date <span className="text-kora-error">*</span>
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full border border-kora-grey rounded-kora-md px-3 py-2 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-kora-deep-teal">
                Expiry Date {selectedCredType?.validity === 'Permanent' && '(optional - no expiry)'}
              </label>
              <input
                type="date"
                min={formData.issueDate || undefined}
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full border border-kora-grey rounded-kora-md px-3 py-2 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
                disabled={selectedCredType?.validity === 'Permanent'}
              />
              {formData.expiryDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Status will be: <strong className={
                    calculateStatus(formData.expiryDate) === 'valid' ? 'text-kora-teal' :
                    calculateStatus(formData.expiryDate) === 'expiring' ? 'text-kora-warning' :
                    'text-kora-error'
                  }>
                    {calculateStatus(formData.expiryDate).toUpperCase()}
                  </strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-kora-deep-teal">
                Upload Certificate <span className="text-kora-error">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full border border-kora-grey rounded-kora-md px-3 py-2 focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG • Max size: 5MB
              </p>
              {file && (
                <p className="text-sm text-kora-teal mt-2">
                  ✓ Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>

            {uploading && (
              <div className="bg-kora-teal/10 rounded-kora-md p-4">
                <p className="text-sm text-kora-deep-teal mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-full bg-kora-grey rounded-full h-2">
                  <div 
                    className="bg-kora-teal h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-kora-grey">
              <button
                type="submit"
                disabled={loading || !file}
                className="bg-kora-coral text-kora-white px-6 py-3 rounded-kora-md hover:bg-[#CC5454] shadow-kora-sm disabled:bg-kora-grey disabled:text-gray-500 font-medium"
              >
                {loading ? 'Uploading...' : 'Upload Credential'}
              </button>
              <Link
                href={`/workers/${workerId}`}
                className="bg-white text-kora-deep-teal border border-kora-grey px-6 py-3 rounded-kora-md hover:bg-gray-50 font-medium inline-block"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-kora-teal/10 rounded-kora-md border border-kora-teal/20">
            <p className="text-sm text-kora-deep-teal">
              <strong>Note:</strong> Certificates will be securely stored and accessible to RPs you share with.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
