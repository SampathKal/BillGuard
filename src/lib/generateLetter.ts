import type { BillAnalysis } from './analyzeBill'

export interface DisputeLetter {
  recipientType: 'hospital' | 'insurance'
  subject: string
  body: string
  generatedAt: string
}

export async function generateDisputeLetter(
  analysis: BillAnalysis,
  recipientType: 'hospital' | 'insurance'
): Promise<DisputeLetter> {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const errorList = analysis.errors.map(e =>
    `- ${e.title}: ${e.description} (Legal basis: ${e.statute})`
  ).join('\n')

  const prompt = `You are a healthcare billing attorney drafting a formal dispute letter. 
  
Generate a COMPLETE, ready-to-send dispute letter to the ${recipientType === 'hospital' ? 'hospital billing department' : 'insurance company'}.

Bill details:
- Provider: ${analysis.provider || 'Medical Provider'}
- Patient: ${analysis.patientName || '[PATIENT NAME]'}
- Service Date: ${analysis.serviceDate || '[SERVICE DATE]'}
- Total Billed: ${analysis.totalBilled ? '$' + analysis.totalBilled.toLocaleString() : 'Amount on file'}
- Errors Found: ${analysis.totalErrors}
- Estimated Overcharge: $${analysis.estimatedRecovery.toLocaleString()}

Errors identified:
${errorList}

Write a professional, firm, legally precise dispute letter dated ${today}.

The letter should:
1. Open with patient info and account/reference numbers (use placeholders like [ACCOUNT NUMBER])
2. Clearly state this is a formal billing dispute
3. List each error with specific legal citations (ERISA, ACA, state laws, 42 CFR as applicable)  
4. Demand specific corrective actions (refund, re-adjudication, corrected EOB)
5. Set a 30-day response deadline
6. Reference the right to file complaints with state insurance commissioner, CMS, and CFPB if unresolved
7. Close professionally with signature block placeholders

Use firm but professional legal language. This letter must be intimidating enough to get results.
Format as plain text ready to copy and send. Use [BRACKETED PLACEHOLDERS] for info the patient needs to fill in.
Return ONLY the letter text, no JSON, no explanation.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)

  const data = await response.json()
  const body = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''

  return {
    recipientType,
    subject: `Formal Billing Dispute — ${analysis.provider || 'Medical Provider'} — ${analysis.patientName || 'Patient'}`,
    body,
    generatedAt: today,
  }
}
