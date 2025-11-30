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

MANDATORY REQUIREMENTS (from Quality Standard 2.9.1, 2.9.6, and Aged Care Act 2024):

**SCREENING (worker must have ONE of):**
- NDIS Worker Screening Check (valid 5 years) OR
- National Police Check (valid 3 years)
PLUS if applicable:
- International Criminal History Declaration (if lived overseas since age 16)
- Working with Children Check (state/territory specific)
- Working with Vulnerable People Card (TAS/ACT only)

**QUALIFICATIONS (role-specific):**
- Care Workers: Certificate III in Individual Support (or equivalent)
- Registered Nurses: Current AHPRA Registration (annual renewal)
- Allied Health: Professional registration under relevant National Law

**MANDATORY TRAINING (annual renewal required for all):**
- Current CPR Certification (12 months)
- Code of Conduct Training (12 months)
- SIRS Training (12 months)
- Infection Control Training (12 months)
- Manual Handling Training (12 months)

**CORE COMPETENCIES (Quality Standard 2.9.6):**
- Person-centred, rights-based care training
- Culturally safe, trauma-aware care training
- Dementia care training
- Medical emergency response training

Provide a brief compliance summary (2-3 sentences max) in plain English. Use this traffic light system:

🟢 GREEN: All mandatory requirements met, all credentials current (none expiring within 90 days)
🟡 YELLOW: Missing optional credentials OR any credentials expiring within 90 days
🔴 RED: Missing mandatory screening, expired mandatory credentials, or critical compliance gaps

FORMAT: Start with the emoji, then 2-3 sentences explaining the status. Be specific about what's missing or expiring.

EXAMPLES:
🟢 "Jane Smith is fully compliant. All mandatory credentials including Police Check, CPR, and training records are current and valid. She is cleared for service delivery."

🟡 "Jane Smith's CPR certification expires in 45 days. While her other credentials (Police Check, NDIS, training records) are valid, urgent renewal is needed to maintain full compliance."

🔴 "Jane Smith has critical compliance gaps: missing SIRS training and expired Code of Conduct (expired October 1, 2025). She cannot commence or continue providing aged care services until these mandatory credentials are obtained and verified."
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