import { motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, ChevronUp, FileText, ArrowRight, RotateCcw, Shield, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'
import type { BillAnalysis, BillingError } from '../lib/analyzeBill'

interface ResultsScreenProps {
  analysis: BillAnalysis
  preview: string
  onGenerateLetter: (type: 'hospital' | 'insurance') => void
  onStartOver: () => void
  isGenerating: boolean
}

const severityColors = {
  high: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  medium: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  low: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
}

const errorTypeLabels: Record<string, string> = {
  duplicate: 'Duplicate Charge',
  upcoding: 'Upcoding',
  unbundling: 'Improper Unbundling',
  never_happened: 'Phantom Service',
  illegal_denial: 'Illegal Denial',
  balance_billing: 'Illegal Balance Billing',
  miscoding: 'Billing Code Error',
}

function ErrorCard({ error }: { error: BillingError }) {
  const [expanded, setExpanded] = useState(false)
  const colors = severityColors[error.severity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border ${colors.border} ${colors.bg} rounded-xl overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 text-left"
      >
        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${error.severity === 'high' ? 'bg-red-400' : error.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
              {error.severity.toUpperCase()}
            </span>
            <span className="text-white/40 text-xs">{errorTypeLabels[error.type] || error.type}</span>
            {error.estimatedOvercharge && (
              <span className="text-white/60 text-xs ml-auto font-medium">
                ~${error.estimatedOvercharge.toLocaleString()} overcharge
              </span>
            )}
          </div>
          <p className={`font-medium text-sm ${colors.text}`}>{error.title}</p>
          {!expanded && (
            <p className="text-white/50 text-xs mt-1 line-clamp-1">{error.description}</p>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-white/30 flex-shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-6 space-y-3">
          {error.lineItem && (
            <div>
              <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Line Item</p>
              <p className="text-white/70 text-sm font-mono bg-black/30 rounded-lg px-3 py-2">{error.lineItem}</p>
            </div>
          )}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wide mb-1">What's Wrong</p>
            <p className="text-white/70 text-sm leading-relaxed">{error.description}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Your Legal Protection</p>
            <p className="text-white/70 text-sm leading-relaxed">{error.legalBasis}</p>
          </div>
          <div className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 bg-black/20">
            <Shield size={13} className="text-[#64CEFB] flex-shrink-0" />
            <p className="text-[#64CEFB] text-xs font-mono">{error.statute}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function ResultsScreen({ analysis, preview, onGenerateLetter, onStartOver, isGenerating }: ResultsScreenProps) {
  const highCount = analysis.errors.filter(e => e.severity === 'high').length
  const hasErrors = analysis.totalErrors > 0

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button onClick={onStartOver} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <RotateCcw size={14} />
          Scan another bill
        </button>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10 rounded-2xl p-6 mb-6 bg-white/[0.02]"
        >
          <div className="flex items-start gap-4">
            <img src={preview} alt="Bill" className="w-16 h-20 object-cover rounded-lg border border-white/10 flex-shrink-0 opacity-70" />
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs mb-1">{analysis.provider || 'Medical Provider'}</p>
              <h1 className="text-white text-xl font-medium tracking-tight mb-1">
                {hasErrors ? `${analysis.totalErrors} error${analysis.totalErrors !== 1 ? 's' : ''} found` : 'No errors detected'}
              </h1>
              <p className="text-white/50 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
          </div>

          {hasErrors && (
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/5">
              <div className="text-center">
                <p className="text-red-400 text-2xl font-semibold">{highCount}</p>
                <p className="text-white/40 text-xs mt-0.5">High Severity</p>
              </div>
              <div className="text-center">
                <p className="text-white text-2xl font-semibold">{analysis.totalErrors}</p>
                <p className="text-white/40 text-xs mt-0.5">Total Errors</p>
              </div>
              <div className="text-center">
                <p className="text-[#64CEFB] text-2xl font-semibold">
                  ${analysis.estimatedRecovery > 0 ? analysis.estimatedRecovery.toLocaleString() : '?'}
                </p>
                <p className="text-white/40 text-xs mt-0.5">Est. Recovery</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error list */}
        {hasErrors ? (
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-red-400" />
              <h2 className="text-white font-medium text-sm">Errors Detected</h2>
            </div>
            {analysis.errors.map((error, i) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <ErrorCard error={error} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-green-500/20 bg-green-500/5 rounded-2xl p-8 text-center mb-8"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield size={20} className="text-green-400" />
            </div>
            <p className="text-green-400 font-medium mb-2">Your bill looks clean</p>
            <p className="text-white/40 text-sm">We didn't find obvious errors. If something still feels wrong, try uploading a clearer image or contact a patient advocate.</p>
          </motion.div>
        )}

        {/* Generate letter CTAs */}
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText size={15} className="text-[#64CEFB]" />
              <h2 className="text-white font-medium text-sm">Generate Dispute Letter</h2>
            </div>

            <button
              onClick={() => onGenerateLetter('hospital')}
              disabled={isGenerating}
              className="group w-full flex items-center justify-between border border-white/10 rounded-xl px-5 py-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <TrendingUp size={16} className="text-[#64CEFB]" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Letter to Hospital Billing</p>
                  <p className="text-white/40 text-xs">Dispute charges directly with the provider</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onGenerateLetter('insurance')}
              disabled={isGenerating}
              className="group w-full flex items-center justify-between border border-white/10 rounded-xl px-5 py-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Zap size={16} className="text-[#64CEFB]" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Letter to Insurance Company</p>
                  <p className="text-white/40 text-xs">Appeal denials and demand re-adjudication</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            {isGenerating && (
              <div className="flex items-center justify-center gap-2 py-3 text-[#64CEFB] text-sm">
                <div className="w-4 h-4 border-2 border-[#64CEFB] border-t-transparent rounded-full animate-spin" />
                Drafting your letter with legal citations...
              </div>
            )}
          </motion.div>
        )}

        {/* Legal note */}
        <p className="text-white/20 text-xs text-center mt-10 leading-relaxed max-w-sm mx-auto">
          BillGuard is not a law firm. Letters are legal templates, not legal advice. For complex cases, consult a healthcare attorney.
        </p>
      </div>
    </div>
  )
}
