import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, FileText, X, AlertCircle } from 'lucide-react'

interface ScanScreenProps {
  onImageReady: (base64: string, mimeType: string, preview: string) => void
}

export default function ScanScreen({ onImageReady }: ScanScreenProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image file (JPG, PNG, HEIC) or PDF.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Max 20MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const base64 = result.split(',')[1]
      const mimeType = file.type === 'application/pdf' ? 'image/jpeg' : file.type as 'image/jpeg' | 'image/png' | 'image/webp'
      onImageReady(base64, mimeType, result)
    }
    reader.readAsDataURL(file)
  }, [onImageReady])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-6 bg-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#64CEFB] animate-pulse" />
            <span className="text-white/60 text-xs tracking-wide">AI Ready</span>
          </div>
          <h1 className="text-white text-4xl sm:text-5xl font-medium tracking-tighter leading-tight mb-4">
            Upload your bill.<br />
            <span className="text-white/40">We'll handle the rest.</span>
          </h1>
          <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Photo of your bill, EOB, or denial letter. Works with any US hospital, clinic, or insurance company.
          </p>
        </div>

        {/* Drop Zone */}
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          animate={{
            borderColor: dragging ? 'rgba(100,206,251,0.6)' : 'rgba(255,255,255,0.1)',
            backgroundColor: dragging ? 'rgba(100,206,251,0.05)' : 'rgba(255,255,255,0.02)',
          }}
          className="relative border-2 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center gap-5 cursor-pointer transition-colors duration-200 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Upload size={24} className="text-[#64CEFB]" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">Drop your bill here</p>
            <p className="text-white/40 text-sm">or click to browse</p>
          </div>
          <div className="flex items-center gap-3 text-white/25 text-xs">
            <span>JPG</span><span>·</span><span>PNG</span><span>·</span><span>HEIC</span><span>·</span><span>PDF</span><span>·</span><span>up to 20MB</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>

        {/* Camera option for mobile */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = 'image/*'
                fileRef.current.capture = 'environment'
                fileRef.current.click()
                setTimeout(() => {
                  if (fileRef.current) fileRef.current.capture = ''
                }, 100)
              }
            }}
            className="flex items-center justify-center gap-2 border border-white/10 rounded-xl py-3.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <Camera size={16} />
            Take Photo
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 border border-white/10 rounded-xl py-3.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <FileText size={16} />
            Upload File
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 border border-red-500/20 bg-red-500/10 rounded-xl px-4 py-3"
            >
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/25 text-xs">
          {['HIPAA Secure', 'End-to-End Encrypted', 'Never Sold', 'Deleted After Analysis'].map(b => (
            <span key={b} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              {b}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
