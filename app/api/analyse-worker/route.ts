import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { workerId } = await request.json()
    
    const supabase = await createClient()
    
    // Get worker details
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single()
    
    if (workerError || !worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }
    
    // Get worker credentials
    const { data: credentials } = await supabase
      .from('worker_credentials')
      .select(`
        *,
        credential_types (name, required, valid_period_days)
      `)
      .eq('worker_id', workerId)
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = `
You are an aged care compliance expert analyzing worker credentials against the Aged Care Act 2024 and Quality Standards (February 2025).

Worker: ${worker.name}
Role: ${worker.role}

Current Credentials:
${credentials?.map((c: any) => `- ${c.credential_types?.name || 'Unknown'}: ${c.status} (Expires: ${c.expiry_date || 'N/A'})`).join('\n') || 'None'}

MANDATORY REQUIREMENTS (from Quality Standard 2.9.1 and 2.9.6):

**Screening (worker must have ONE of):**
- NDIS Worker Screening Check (valid 5 years) OR
- National Police Check (valid 3 years)

**Mandatory Training (annual renewal required):**
- Current CPR Certification (12 months)
- Manual Handling Training (12 months)
- Infection Control Training (12 months)
- Code of Conduct Training (12 months)
- SIRS Training (12 months)

**Role-Specific:**
- Personal Care Assistants: Certificate III in Individual Support
- Registered Nurses: Current AHPRA Registration (annual)

Provide a brief compliance summary (2-3 sentences) in plain English. Use this traffic light system:
🟢 GREEN: All mandatory requirements met, credentials current
🟡 YELLOW: Missing optional credentials OR credentials expiring within 90 days
🔴 RED: Missing mandatory screening, expired CPR, or other critical compliance gaps

Format: Start with the emoji, then your summary. Be specific about what's missing or expiring.
`
    
    const result = await model.generateContent(prompt)
    const analysis = result.response.text()
    
    return NextResponse.json({ analysis })
    
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze compliance',
      details: error.message 
    }, { status: 500 })
  }
}
