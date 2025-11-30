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
Analyze the compliance status of this aged care worker:

Worker: ${worker.name}
Role: ${worker.role}

Credentials:
${credentials?.map((c: any) => `- ${c.credential_types?.name || 'Unknown'}: ${c.status} (Expires: ${c.expiry_date || 'N/A'})`).join('\n')}

Required credentials for aged care workers:
- National Police Check (valid within 3 years)
- NDIS Worker Screening Check (valid within 5 years)
- Current CPR Certification (valid within 1 year)
- First Aid Certificate (valid within 3 years)

Provide a brief compliance analysis including:
1. Overall compliance status
2. Any missing or expired credentials
3. Recommended actions
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
