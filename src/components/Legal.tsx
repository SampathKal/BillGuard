import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

export default function Legal() {
  return (
    <section id="legal" className="bg-black py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-white/[0.02]"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={18} className="text-white/40 mt-0.5 flex-shrink-0" />
            <p className="text-white/40 text-xs uppercase tracking-widest">Legal Disclaimer</p>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-4xl">
            BillGuard is an AI-powered billing analysis and document generation tool. It is <strong className="text-white/70">not a law firm</strong> and does not provide legal advice. The dispute letters generated are informational templates based on publicly available laws and common billing dispute patterns. Results are not guaranteed. For complex legal matters, consult a licensed healthcare attorney or patient advocate in your state. BillGuard does not guarantee recovery of any specific amount. All medical data is handled in compliance with HIPAA. By using BillGuard, you agree to our{' '}
            <a href="#" className="text-[#64CEFB] hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-[#64CEFB] hover:underline">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
