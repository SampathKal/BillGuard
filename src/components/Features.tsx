import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Scale, Bell, Lock, Globe } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'ERISA & ACA Compliant',
    desc: 'Every dispute letter cites the exact federal and state statutes that apply to your specific case and insurer.',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    desc: 'Results in under 30 seconds. No waiting, no forms, no calls to hold music.',
  },
  {
    icon: Scale,
    title: 'Attorney-Reviewed Templates',
    desc: 'Our dispute letter templates were crafted and reviewed by healthcare billing attorneys — the same language that gets results.',
  },
  {
    icon: Bell,
    title: 'Dispute Tracking',
    desc: 'Get notified when your insurer or hospital responds. We keep the pressure on so you don\'t have to.',
  },
  {
    icon: Lock,
    title: 'HIPAA Secure',
    desc: 'End-to-end encryption. Your medical data never leaves our secure servers unprotected.',
  },
  {
    icon: Globe,
    title: 'All 50 States',
    desc: 'State-specific legal language automatically applied based on where your care was received.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-[#050505] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 sm:mb-20"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Why BillGuard</p>
          <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter leading-tight max-w-2xl">
            Built to win.<br />
            <span className="text-white/50">Not just explain.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-[#050505] p-8 hover:bg-white/[0.03] transition-colors duration-300"
            >
              <f.icon size={20} className="text-[#64CEFB] mb-5" />
              <h3 className="text-white font-medium text-lg mb-2 tracking-tight">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
