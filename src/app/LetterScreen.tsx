import { motion } from 'framer-motion'
import { Copy, Download, Mail, ArrowLeft, Check, Shield } from 'lucide-react'
import { useState } from 'react'
import type { DisputeLetter } from '../lib/generateLetter'

interface LetterScreenProps {
  letter: DisputeLetter
  onBack: () => void
}

export default function LetterScreen({ letter, onBack }: LetterScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownload = () => {
    const blob = new Blob([letter.body], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BillGuard_Dispute_Letter_${letter.recipientType}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(letter.subject)
    const body = encodeURIComponent(letter.body)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Back to results
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 border border-[#64CEFB]/20 bg-[#64CEFB]/10 rounded-full px-3 py-1 mb-4">
            <Shield size={12} className="text-[#64CEFB]" />
            <span className="text-[#64CEFB] text-xs">Attorney-Reviewed Template</span>
          </div>
          <h1 className="text-white text-3xl font-medium tracking-tight mb-2">
            Your dispute letter is ready.
          </h1>
          <p className="text-white/50 text-sm">
            To: <span className="text-white/70 font-medium capitalize">{letter.recipientType === 'hospital' ? 'Hospital Billing Department' : 'Insurance Company'}</span>
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 border border-white/10 rounded-xl py-3.5 hover:bg-white/5 transition-colors text-white/60 hover:text-white"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-1.5 border border-white/10 rounded-xl py-3.5 hover:bg-white/5 transition-colors text-white/60 hover:text-white"
          >
            <Download size={16} />
            <span className="text-xs">Download</span>
          </button>
          <button
            onClick={handleEmail}
            className="flex flex-col items-center gap-1.5 border border-white/10 rounded-xl py-3.5 hover:bg-white/5 transition-colors text-white/60 hover:text-white"
          >
            <Mail size={16} />
            <span className="text-xs">Open in Mail</span>
          </button>
        </motion.div>

        {/* One-tap highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <button
            onClick={handleCopy}
            className="w-full bg-white text-black rounded-xl py-4 font-medium text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied to clipboard — paste into an email!' : 'Copy letter — ready to paste & send'}
          </button>
        </motion.div>

        {/* Letter body */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wide">Letter Preview</p>
            <p className="text-white/25 text-xs">{letter.generatedAt}</p>
          </div>
          <div className="p-5 sm:p-6">
            <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {letter.body}
            </pre>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 border border-white/5 rounded-xl p-5 bg-white/[0.01]"
        >
          <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-3">Next Steps</p>
          <ol className="space-y-2 text-white/50 text-sm">
            <li className="flex gap-2"><span className="text-white/25 flex-shrink-0">1.</span>Fill in all <span className="text-white/70 font-mono">[BRACKETED PLACEHOLDERS]</span> with your info</li>
            <li className="flex gap-2"><span className="text-white/25 flex-shrink-0">2.</span>Send via certified mail <span className="font-medium text-white/70">and</span> email to create a paper trail</li>
            <li className="flex gap-2"><span className="text-white/25 flex-shrink-0">3.</span>They have 30 days to respond — if they don't, escalate to your state insurance commissioner</li>
            <li className="flex gap-2"><span className="text-white/25 flex-shrink-0">4.</span>Keep a copy of everything you send and receive</li>
          </ol>
        </motion.div>

        {/* Legal disclaimer */}
        <p className="text-white/20 text-xs text-center mt-8 leading-relaxed max-w-sm mx-auto">
          This letter is a template, not legal advice. BillGuard is not a law firm. Results not guaranteed. Consult a healthcare attorney for complex cases.
        </p>
      </div>
    </div>
  )
}
