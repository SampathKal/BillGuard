import { motion } from 'framer-motion'
import { Camera, ScanSearch, FileText, Send } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    step: '01',
    title: 'Photograph Your Bill',
    desc: 'Take a clear photo of your medical bill, EOB, or insurance denial letter. Works with any hospital or insurance provider in the US.',
  },
  {
    icon: ScanSearch,
    step: '02',
    title: 'AI Scans for Errors',
    desc: 'Our AI cross-references your bill against 200+ known billing error patterns — duplicate charges, upcoding, unbundling, and more.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Dispute Letter Generated',
    desc: 'A legally precise dispute letter is drafted instantly, citing applicable ERISA, ACA, and state insurance laws relevant to your case.',
  },
  {
    icon: Send,
    step: '04',
    title: 'Send with One Tap',
    desc: 'Send directly to your hospital billing department and insurance company. We track your dispute and alert you to responses.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-black py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">The Process</p>
          <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter leading-tight">
            Four steps.<br />
            <span className="text-white/50">One tap to fight back.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative border border-white/10 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <step.icon size={18} className="text-[#64CEFB]" />
                </div>
                <span className="text-white/20 text-4xl font-bold leading-none">{step.step}</span>
              </div>
              <h3 className="text-white font-medium text-lg mb-2 tracking-tight">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
