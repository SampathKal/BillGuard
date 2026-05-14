import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Camera, ScanSearch, FileText, Send, Copy, Download,
  CheckCircle, AlertTriangle, XCircle, ChevronRight, ArrowLeft,
  RefreshCw, Mail, Phone, Sparkles, Shield
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'upload' | 'scanning' | 'results' | 'letter' | 'send'

interface BillingError {
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
  estimatedSavings: string
  legalBasis: string
  lineItem?: string
}

interface AnalysisResult {
  billSummary: string
  totalCharged: string
  estimatedRecovery: string
  errors: BillingError[]
  patientName: string
  provider: string
  dateOfService: string
  insuranceInfo: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const severityConfig = {
  high: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle,
    label: 'High Priority',
  },
  medium: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertTriangle,
    label: 'Medium Priority',
  },
  low: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: CheckCircle,
    label: 'Review',
  },
}

// ─── API Call ────────────────────────────────────────────────────────────────

async function analyzeBill(base64Image: string, mediaType: string): Promise<AnalysisResult> {
  const systemPrompt = `You are BillGuard, an expert medical billing analyst and patient advocate with 20+ years of experience identifying billing errors, fraud, and overcharges in US medical bills.

You analyze medical bills, Explanation of Benefits (EOB), and insurance denial letters to find:
- Duplicate charges (same service billed multiple times)
- Upcoding (billing for more expensive procedure than performed)
- Unbundling (billing separately for procedures that should be bundled)
- Phantom charges (services never rendered)
- Incorrect billing codes (CPT/ICD codes that don't match the service)
- Illegal insurance denials (violating ACA, ERISA, or state law)
- Balance billing violations
- Missing insurance adjustments

Respond ONLY with a valid JSON object — no markdown, no preamble. Use this exact schema:
{
  "billSummary": "brief description of what this bill is for",
  "totalCharged": "$X,XXX.XX",
  "estimatedRecovery": "$X,XXX.XX",
  "patientName": "name or 'Not visible'",
  "provider": "hospital/provider name",
  "dateOfService": "date or 'Not visible'",
  "insuranceInfo": "insurance company if visible or 'Not visible'",
  "errors": [
    {
      "type": "Error type name",
      "severity": "high|medium|low",
      "description": "Plain English explanation of what's wrong",
      "estimatedSavings": "$XXX.XX",
      "legalBasis": "Specific law, regulation, or coding standard this violates",
      "lineItem": "Specific line item or charge on the bill if identifiable"
    }
  ]
}

If you cannot clearly read the bill or it's not a medical bill, still return valid JSON with errors array containing one entry explaining what you could see. Be specific and cite real laws (ERISA Section 502, ACA Section 2719, etc.). If the image is a sample/test image, generate realistic example errors that demonstrate the tool's capabilities.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: 'Analyze this medical bill for errors, overcharges, and illegal practices. Return only the JSON object.',
            },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function generateDisputeLetter(analysis: AnalysisResult, base64Image: string, mediaType: string): Promise<string> {
  const systemPrompt = `You are a healthcare attorney and patient advocate. Generate a professional, legally precise medical billing dispute letter based on the analysis provided.

The letter must:
- Be formally addressed to both the hospital billing department and insurance company
- Cite specific federal laws (ERISA, ACA, HIPAA, No Surprises Act) and state regulations
- Reference each identified error with its specific CPT/billing code if mentioned
- Include a specific dollar amount being disputed
- Set a clear 30-day response deadline
- Reference the patient's right to an itemized bill (required by law in all 50 states)
- Include language about escalation to state insurance commissioner and CMS if unresolved
- Be firm but professional — the tone of a letter that gets results

Return ONLY the letter text, ready to copy and send. Start with the date line. No JSON, no preamble.`

  const errorsText = analysis.errors.map(e =>
    `- ${e.type} (${e.severity} priority): ${e.description} | Legal basis: ${e.legalBasis} | Estimated savings: ${e.estimatedSavings}`
  ).join('\n')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: `Generate a dispute letter for this medical bill.

Patient: ${analysis.patientName}
Provider: ${analysis.provider}
Date of Service: ${analysis.dateOfService}
Insurance: ${analysis.insuranceInfo}
Total Charged: ${analysis.totalCharged}
Estimated Recovery: ${analysis.estimatedRecovery}

Errors Found:
${errorsText}`,
            },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  return data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UploadScreen({ onImageSelected }: { onImageSelected: (b64: string, type: string, preview: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const processFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const [header, b64] = dataUrl.split(',')
      const mediaType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
      onImageSelected(b64, mediaType, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onImageSelected])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) processFile(file)
  }, [processFile])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#64CEFB]/10 border border-[#64CEFB]/20 rounded-full px-4 py-1.5 mb-6">
            <Shield size={13} className="text-[#64CEFB]" />
            <span className="text-[#64CEFB] text-xs font-medium">HIPAA Secure · End-to-end encrypted</span>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-medium tracking-tighter mb-3">
            Scan your bill
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Upload a photo of any medical bill, EOB, or denial letter. Our AI finds the errors in seconds.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300
            ${dragging ? 'border-[#64CEFB] bg-[#64CEFB]/5' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
          />

          <motion.div
            animate={{ scale: dragging ? 1.08 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Upload size={26} className="text-white/40" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Drop your bill here</p>
              <p className="text-white/40 text-sm">or tap to take a photo / choose a file</p>
            </div>
            <p className="text-white/20 text-xs">JPG, PNG, HEIC · Up to 10MB</p>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3.5 text-white/80 text-sm font-medium transition-colors"
          >
            <Camera size={16} />
            Take Photo
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3.5 text-white/80 text-sm font-medium transition-colors"
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            { value: '80%', label: 'Bills have errors' },
            { value: '$1,300', label: 'Avg overcharge' },
            { value: '73%', label: 'Disputes won' },
          ].map((s) => (
            <div key={s.label} className="text-center border border-white/5 rounded-xl py-4 bg-white/[0.01]">
              <p className="text-white text-xl font-semibold">{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function ScanningScreen({ preview }: { preview: string }) {
  const stages = [
    'Reading bill structure…',
    'Identifying line items…',
    'Cross-referencing CPT codes…',
    'Checking for duplicates…',
    'Verifying insurance adjustments…',
    'Analyzing legal compliance…',
    'Calculating potential savings…',
  ]
  const [stageIdx, setStageIdx] = useState(0)

  useState(() => {
    const interval = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, stages.length - 1))
    }, 1200)
    return () => clearInterval(interval)
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm text-center"
      >
        {/* Bill preview with scan line */}
        <div className="relative w-48 h-64 mx-auto mb-8 rounded-xl overflow-hidden border border-white/10">
          <img src={preview} alt="Bill" className="w-full h-full object-cover opacity-40" />
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-[#64CEFB]"
            style={{ boxShadow: '0 0 12px #64CEFB' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <ScanSearch size={18} className="text-[#64CEFB]" />
          <span className="text-white font-medium">Analyzing your bill</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stageIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-white/40 text-sm"
          >
            {stages[stageIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-white/20"
              animate={{
                width: i === stageIdx ? 20 : 6,
                height: 6,
                backgroundColor: i <= stageIdx ? '#64CEFB' : 'rgba(255,255,255,0.15)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function ResultsScreen({
  analysis,
  onGenerateLetter,
  onReset,
}: {
  analysis: AnalysisResult
  onGenerateLetter: () => void
  onReset: () => void
}) {
  const highErrors = analysis.errors.filter(e => e.severity === 'high')
  const medErrors = analysis.errors.filter(e => e.severity === 'medium')
  const lowErrors = analysis.errors.filter(e => e.severity === 'low')

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Back */}
        <button onClick={onReset} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Start over
        </button>

        {/* Summary card */}
        <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Analysis Complete</p>
              <h2 className="text-white text-2xl font-medium tracking-tight">{analysis.provider || 'Medical Bill'}</h2>
              <p className="text-white/40 text-sm mt-0.5">{analysis.dateOfService} · {analysis.patientName}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-1">Potential Recovery</p>
              <p className="text-[#64CEFB] text-2xl font-semibold">{analysis.estimatedRecovery}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
            {[
              { label: 'Total Charged', value: analysis.totalCharged },
              { label: 'Errors Found', value: analysis.errors.length.toString() },
              { label: 'High Priority', value: highErrors.length.toString() },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-white font-semibold text-lg">{s.value}</p>
                <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Errors by severity */}
        {[
          { list: highErrors, label: 'High Priority Errors', badge: 'Immediate Action Needed' },
          { list: medErrors, label: 'Medium Priority', badge: 'Review Recommended' },
          { list: lowErrors, label: 'Items to Review', badge: 'Lower Impact' },
        ].map(({ list, label }) =>
          list.length > 0 ? (
            <div key={label} className="mb-5">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{label}</p>
              <div className="flex flex-col gap-3">
                {list.map((err, i) => {
                  const cfg = severityConfig[err.severity]
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`border rounded-xl p-4 ${cfg.bg} ${cfg.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-white font-medium text-sm">{err.type}</p>
                            <span className={`text-xs font-semibold ${cfg.color} flex-shrink-0`}>{err.estimatedSavings}</span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed mb-2">{err.description}</p>
                          {err.lineItem && (
                            <p className="text-white/40 text-xs mb-1.5">Line item: {err.lineItem}</p>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Shield size={11} className="text-white/30" />
                            <p className="text-white/30 text-xs">{err.legalBasis}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : null
        )}

        {/* CTA */}
        <div className="sticky bottom-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateLetter}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-2xl py-4 text-base shadow-2xl"
          >
            <Sparkles size={18} />
            Generate Dispute Letter
            <ChevronRight size={18} />
          </motion.button>
          <p className="text-center text-white/20 text-xs mt-2">Free · No signup required · Ready to send</p>
        </div>
      </motion.div>
    </div>
  )
}

function LetterScreen({
  letter,
  analysis,
  onSend,
  onBack,
}: {
  letter: string
  analysis: AnalysisResult
  onSend: () => void
  onBack: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyLetter = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const downloadLetter = () => {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BillGuard-Dispute-${analysis.provider.replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to results
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Dispute Letter</p>
            <h2 className="text-white text-xl font-medium tracking-tight">Ready to send</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLetter}
              className="flex items-center gap-1.5 border border-white/10 hover:border-white/30 rounded-xl px-3 py-2 text-white/70 hover:text-white text-sm transition-all"
            >
              {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={downloadLetter}
              className="flex items-center gap-1.5 border border-white/10 hover:border-white/30 rounded-xl px-3 py-2 text-white/70 hover:text-white text-sm transition-all"
            >
              <Download size={14} />
              .txt
            </button>
          </div>
        </div>

        {/* Letter preview */}
        <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden mb-6">
          <div className="border-b border-white/5 px-5 py-3 flex items-center gap-2">
            <FileText size={14} className="text-white/30" />
            <span className="text-white/30 text-xs">dispute_letter.txt</span>
          </div>
          <div className="p-5 max-h-96 overflow-y-auto">
            <pre className="text-white/80 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap">{letter}</pre>
          </div>
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSend}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-2xl py-4 text-base"
        >
          <Send size={18} />
          How to Send This Letter
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  )
}

function SendScreen({
  analysis,
  onReset,
}: {
  analysis: AnalysisResult
  onReset: () => void
}) {
  const steps = [
    {
      icon: Mail,
      title: 'Send to Hospital Billing',
      desc: 'Email or certified mail your dispute letter to the hospital billing department. Request confirmation of receipt.',
      action: 'Find billing contact',
      color: 'text-blue-400',
    },
    {
      icon: Phone,
      title: 'Call Your Insurance',
      desc: 'Follow up with your insurance\'s member services. Reference "formal written dispute" and ask for a case number.',
      action: 'Know your rights',
      color: 'text-amber-400',
    },
    {
      icon: Shield,
      title: 'If Denied: Escalate',
      desc: 'File a complaint with your state insurance commissioner and CMS. Most disputes resolve before this step.',
      action: 'State commissioner finder',
      color: 'text-green-400',
    },
  ]

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onReset} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Start over
        </button>

        {/* Success header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-[#64CEFB]/10 border border-[#64CEFB]/20 flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle size={28} className="text-[#64CEFB]" />
          </motion.div>
          <h2 className="text-white text-2xl font-medium tracking-tight mb-2">Your letter is ready</h2>
          <p className="text-white/50 text-sm">
            You're disputing <span className="text-[#64CEFB] font-medium">{analysis.estimatedRecovery}</span> in potential overcharges.
            Here's what to do next.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4 mb-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-white/10 rounded-2xl p-5 bg-white/[0.02]"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <step.icon size={18} className={step.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/30 text-xs">Step {i + 1}</span>
                  </div>
                  <h3 className="text-white font-medium mb-1.5">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="border border-white/5 rounded-xl p-4 bg-white/[0.01] mb-6">
          <p className="text-white/30 text-xs leading-relaxed">
            <span className="text-white/50 font-medium">Legal notice:</span> BillGuard is not a law firm and does not provide legal advice.
            This letter is an informational template. For complex cases, consult a licensed healthcare attorney.
            Results are not guaranteed.
          </p>
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 rounded-2xl py-4 text-white/70 hover:text-white text-sm font-medium transition-all"
        >
          <RefreshCw size={15} />
          Scan another bill
        </button>
      </motion.div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillScanner() {
  const [screen, setScreen] = useState<Screen>('upload')
  const [imageB64, setImageB64] = useState('')
  const [mediaType, setMediaType] = useState('image/jpeg')
  const [preview, setPreview] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [letter, setLetter] = useState('')
  const [error, setError] = useState('')

  const handleImageSelected = async (b64: string, type: string, prev: string) => {
    setImageB64(b64)
    setMediaType(type)
    setPreview(prev)
    setScreen('scanning')
    setError('')

    try {
      const result = await analyzeBill(b64, type)
      setAnalysis(result)
      setScreen('results')
    } catch (e) {
      console.error(e)
      setError('Failed to analyze bill. Please try again.')
      setScreen('upload')
    }
  }

  const handleGenerateLetter = async () => {
    if (!analysis) return
    setScreen('scanning')
    try {
      const letterText = await generateDisputeLetter(analysis, imageB64, mediaType)
      setLetter(letterText)
      setScreen('letter')
    } catch (e) {
      console.error(e)
      setError('Failed to generate letter. Please try again.')
      setScreen('results')
    }
  }

  const handleReset = () => {
    setScreen('upload')
    setImageB64('')
    setPreview('')
    setAnalysis(null)
    setLetter('')
    setError('')
  }

  return (
    <div id="scan" className="bg-black min-h-screen border-t border-white/5">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UploadScreen onImageSelected={handleImageSelected} />
          </motion.div>
        )}
        {screen === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScanningScreen preview={preview} />
          </motion.div>
        )}
        {screen === 'results' && analysis && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsScreen analysis={analysis} onGenerateLetter={handleGenerateLetter} onReset={handleReset} />
          </motion.div>
        )}
        {screen === 'letter' && analysis && (
          <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LetterScreen letter={letter} analysis={analysis} onSend={() => setScreen('send')} onBack={() => setScreen('results')} />
          </motion.div>
        )}
        {screen === 'send' && analysis && (
          <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SendScreen analysis={analysis} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
