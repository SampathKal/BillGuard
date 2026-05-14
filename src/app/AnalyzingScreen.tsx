import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const steps = [
  'Reading bill structure...',
  'Cross-referencing CPT codes...',
  'Scanning for duplicate charges...',
  'Checking for upcoding patterns...',
  'Reviewing insurance denial legality...',
  'Calculating potential recovery...',
  'Preparing your results...',
]

interface AnalyzingScreenProps {
  preview: string
}

export default function AnalyzingScreen({ preview }: AnalyzingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, steps.length - 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg flex flex-col items-center gap-10">

        {/* Bill preview with scan animation */}
        <div className="relative w-48 h-64 rounded-xl overflow-hidden border border-white/10">
          <img src={preview} alt="Your bill" className="w-full h-full object-cover opacity-40" />
          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#64CEFB] to-transparent"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, ease: 'linear', repeat: Infinity }}
          />
          {/* Corner accents */}
          {[
            'top-2 left-2 border-t border-l',
            'top-2 right-2 border-t border-r',
            'bottom-2 left-2 border-b border-l',
            'bottom-2 right-2 border-b border-r',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-4 h-4 ${cls} border-[#64CEFB]`} />
          ))}
        </div>

        {/* Status */}
        <div className="text-center">
          <motion.h2
            className="text-white text-2xl font-medium tracking-tight mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Analyzing your bill
          </motion.h2>
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#64CEFB] text-sm"
          >
            {steps[stepIndex]}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1">
          <motion.div
            className="h-1 rounded-full bg-gradient-to-r from-[#64CEFB] to-white"
            initial={{ width: '0%' }}
            animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-white/30 text-xs text-center">
          Checking 200+ known billing error patterns
        </p>
      </div>
    </div>
  )
}
