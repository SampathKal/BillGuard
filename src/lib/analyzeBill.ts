export interface BillingError {
  id: string
  type: 'duplicate' | 'upcoding' | 'unbundling' | 'never_happened' | 'illegal_denial' | 'balance_billing' | 'miscoding'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  lineItem?: string
  billedAmount?: number
  estimatedOvercharge?: number
  legalBasis: string
  statute: string
}

export interface BillAnalysis {
  patientName?: string
  provider?: string
  serviceDate?: string
  totalBilled?: number
  totalErrors: number
  estimatedRecovery: number
  errors: BillingError[]
  summary: string
  billType: 'hospital' | 'insurance_eob' | 'physician' | 'unknown'
}

export async function analyzeBill(base64Image: string, mimeType: string): Promise<BillAnalysis> {
  const systemPrompt = `You are a medical billing fraud detection expert with 20 years of experience. You have deep knowledge of:
- CPT billing codes and common upcoding patterns
- ERISA (Employee Retirement Income Security Act) regulations
- ACA (Affordable Care Act) protections
- State balance billing laws
- Common hospital billing errors: duplicate charges, unbundling, upcoding, charges for services never rendered
- Insurance denial laws and illegal denial patterns

Your job is to analyze a medical bill image and identify errors. Be specific, realistic, and thorough.

Respond ONLY with a valid JSON object matching this exact structure (no markdown, no backticks):
{
  "patientName": "string or null",
  "provider": "string or null", 
  "serviceDate": "string or null",
  "totalBilled": number or null,
  "billType": "hospital" | "insurance_eob" | "physician" | "unknown",
  "summary": "2-3 sentence plain English summary of what you found",
  "estimatedRecovery": number (total dollar amount potentially recoverable),
  "totalErrors": number,
  "errors": [
    {
      "id": "unique string",
      "type": "duplicate" | "upcoding" | "unbundling" | "never_happened" | "illegal_denial" | "balance_billing" | "miscoding",
      "severity": "high" | "medium" | "low",
      "title": "Short error title",
      "description": "Plain English explanation of the error and why it's wrong",
      "lineItem": "The specific charge or line item from the bill if visible",
      "billedAmount": number or null,
      "estimatedOvercharge": number or null,
      "legalBasis": "Plain English explanation of the legal protection that applies",
      "statute": "The specific law, regulation, or code (e.g. 42 CFR 411.15, ERISA Section 502, ACA Section 2719)"
    }
  ]
}

If the image is not a medical bill, still return the JSON structure but set totalErrors to 0 and explain in summary.
Be realistic — not every bill has every error type. Find what's actually there or likely based on the bill shown.
If you can see specific line items, reference them. If the bill is unclear, make reasonable inferences based on what's visible.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64Image }
            },
            {
              type: 'text',
              text: 'Analyze this medical bill for errors, overcharges, duplicate charges, upcoding, unbundling, and any illegal practices. Return only the JSON.'
            }
          ]
        }
      ]
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)
  
  const data = await response.json()
  const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
  
  // Strip any markdown fences just in case
  const clean = text.replace(/```json\n?|```\n?/g, '').trim()
  
  try {
    return JSON.parse(clean) as BillAnalysis
  } catch {
    throw new Error('Failed to parse bill analysis response')
  }
}
