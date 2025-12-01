'use client'

import { useState, use, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCredentialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workerId } = use(params)
  const router = useRouter()
  const [credentialTypes, setCredentialTypes] = useState<any[]>([])
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
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    fetchCredentialTypes()
    fetchWorker()
  }, [workerId])

  async function fetchCredentialTypes() {
    try {
      const { data, error } = await supabase
        .from('credential_types')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCredentialTypes(data || [])
    } catch (error) {
      console.error('Error fetching credential types:', error)
    }
  }

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
    setUploadError(null)
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
      setUploadError('Please select a file to upload')
      return
    }

    setLoading(true)
    setUploading(true)
    setUploadSuccess(false)
    setUploadError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUploadError('You must be logged in')
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organisation_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organisation_id) {
        setUploadError('Profile not found')
        return
      }

      const selectedCredType = credentialTypes.find(ct => ct.id === formData.credentialType)
      
      if (!selectedCredType) {
        setUploadError('Please select a credential type')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${selectedCredType.name.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`
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
          credential_type_id: selectedCredType.id,
          issue_date: formData.issueDate,
          expiry_date: formData.expiryDate || null,
          document_url: filePath,
          status: status,
        }])

      if (insertError) throw insertError

      setUploadSuccess(true)
      
      // Redirect after 2 seconds to show success message
      setTimeout(() => {
        router.push(`/workers/${workerId}`)
      }, 2000)

    } catch (error: any) {
      console.error('Error uploading credential:', error)
      setUploadError(error?.message || 'Failed to upload credential. Please try again.')
    } finally {
      setLoading(false)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const selectedCredType = credentialTypes.find(ct => ct.id === formData.credentialType)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href={`/workers/${workerId}`} 
          className="text-[#4D9B91] hover:text-[#3D8B81] mb-6 inline-flex items-center gap-2 font-semibold transition-colors"
        >
          <span>←</span>
          <span>Back to Worker</span>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-[#4D9B91]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2C5F5D] mb-2">Add Credential</h1>
            {worker && (
              <p className="text-sm text-gray-600">
                Adding credential for <span className="font-semibold text-[#2C5F5D]">{worker.name}</span> 
                <span className="text-gray-400"> • </span>
                <span className="text-gray-500">{worker.role}</span>
              </p>
            )}
          </div>

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-md">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Credential uploaded successfully! Redirecting...</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-md">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <span className="text-2xl">✕</span>
                <span>{uploadError}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Credential Type */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#2C5F5D]">
                Credential Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.credentialType}
                onChange={(e) => setFormData({ ...formData, credentialType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-[#4D9B91] focus:border-[#4D9B91] text-base"
                disabled={loading}
              >
                <option value="">Select credential type...</option>
                <optgroup label="Screening & Clearances">
                  {credentialTypes.filter(ct => ct.category === 'Vetting/Clearance').map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Qualifications & Registration">
                  {credentialTypes.filter(ct => ct.category === 'Registration' || ct.category === 'Certification').map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Training Records">
                  {credentialTypes.filter(ct => ct.category === 'Training Record').map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#2C5F5D]">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-[#4D9B91] focus:border-[#4D9B91] text-base"
                disabled={loading}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#2C5F5D]">
                Expiry Date <span className="text-xs font-normal text-gray-500">(optional for permanent credentials)</span>
              </label>
              <input
                type="date"
                min={formData.issueDate || undefined}
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-[#4D9B91] focus:border-[#4D9B91] text-base"
                disabled={loading}
              />
              {formData.expiryDate && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600">
                    Status will be: <span className={`font-semibold ${
                      calculateStatus(formData.expiryDate) === 'valid' ? 'text-[#4D9B91]' :
                      calculateStatus(formData.expiryDate) === 'expiring' ? 'text-[#F9A826]' :
                      'text-red-500'
                    }`}>
                      {calculateStatus(formData.expiryDate).toUpperCase()}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#2C5F5D]">
                Upload Certificate <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-[#4D9B91] focus:border-[#4D9B91] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#4D9B91] file:text-white hover:file:bg-[#3D8B81] file:cursor-pointer"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Accepted formats: PDF, JPG, PNG • Maximum size: 5MB
              </p>
              {file && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ <span className="font-semibold">{file.name}</span> 
                    <span className="text-green-600"> ({(file.size / 1024).toFixed(0)} KB)</span>
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-[#E8F4F2] rounded-md p-4 border border-[#4D9B91]/20">
                <p className="text-sm font-semibold text-[#2C5F5D] mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#4D9B91] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !file || uploadSuccess}
                className="bg-[#FF8585] text-white px-6 py-3 rounded-md hover:bg-[#FF6B6B] shadow-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold transition-all"
              >
                {loading ? 'Uploading...' : uploadSuccess ? 'Uploaded!' : 'Upload Credential'}
              </button>
              <Link
                href={`/workers/${workerId}`}
                className="bg-white text-[#2C5F5D] border-2 border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 hover:border-gray-400 font-semibold inline-block transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Info Note */}
          <div className="mt-8 p-4 bg-[#E8F4F2] rounded-md border-l-4 border-[#4D9B91]">
            <p className="text-sm text-[#2C5F5D]">
              <span className="font-semibold">🔒 Secure Storage:</span> Certificates are encrypted and stored securely. Access is controlled by authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}