import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/app/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { workerId } = await request.json()
    
    // Get worker details
    const { data: worker } = await supabase
      .from('workers')
      .select('id, name, role')
      .eq('id', workerId)
      .single()
    
    // Get credentials with types for this worker
    const { data: credentials } = await supabase
      .from('credentials')
      .select('*, credential_types(name)')
      .eq('worker_id', workerId)
    
    // Prepare data for Gemini
    const prompt = `
You are an aged care compliance expert. Analyze this worker's credentials and provide a plain-English compliance summary.

Worker: ${worker?.name}
Role: ${worker?.role}

Credentials:
${credentials?.map(c => `- ${c.credential_types?.name || 'Unknown'}: Issued ${c.issue_date || 'N/A'}, Expires ${c.expiry_date || 'N/A'}`).join('\n') || 'None'}

Required credentials for aged care workers:
- National Police Check (valid within 3 years)
- NDIS Worker Screening Check (valid within 5 years)
- Current CPR Certification (valid within 1 year)
- Annual Manual Handling Refresher (valid within 1 year)

Provide a brief compliance summary (2-3 sentences) in plain English. Use a traffic light system:
🟢 GREEN: Fully compliant
🟡 YELLOW: Missing credentials or approaching expiry
🔴 RED: Critical compliance issues

Format: Start with the emoji, then your summary.
`
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const summary = result.response.text()
    
    return NextResponse.json({ 
      summary,
      worker: worker?.name,
      credentialCount: credentials?.length || 0
    })
    
  } catch (error) {
    console.error('Error analyzing worker:', error)
    return NextResponse.json(
      { error: 'Failed to analyze worker' },
      { status: 500 }
    )
  }
}
