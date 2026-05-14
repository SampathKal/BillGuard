import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ShinyText from './ShinyText'

interface HeroProps {
  onScanClick?: () => void
}

export default function Hero({ onScanClick }: HeroProps) {
  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
        autoPlay loop muted playsInline
      />
      <div className="absolute inset-0 bg-black/45 z-10" />

      <div className="relative z-20 flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-28 sm:pt-32">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <p className="text-white/80 text-sm sm:text-base max-w-sm leading-relaxed">
            We put the power of medical billing experts in your pocket — protecting every American from errors, overcharges, and illegal denials hiding in their bills.
          </p>
          <p className="text-white/80 text-sm sm:text-base lg:text-right">
            80% of Medical Bills Contain Errors →
          </p>
        </div>

        <div className="flex flex-col items-center text-center gap-6 sm:gap-8 my-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/80 text-xs sm:text-sm uppercase tracking-widest"
          >
            Your Medical Bills. Scanned. Disputed. Won.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="font-medium leading-[0.85] tracking-tighter text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            <span className="block text-white">Fight Back.</span>
            <ShinyText text="Get Refunded." className="block" speed={3} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
            className="text-white/60 text-sm sm:text-base max-w-lg leading-relaxed"
          >
            Snap a photo of your medical bill. Our AI finds errors, illegal denials &amp; duplicate charges — then generates a legally accurate dispute letter ready to send with one tap.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
          >
            <button
              onClick={onScanClick}
              className="group inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white rounded-full px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base font-medium border border-white/20 transition-all duration-300"
            >
              Scan Your Bill Free
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center lg:justify-between gap-6 lg:gap-0">
          {[
            { label: 'Bills Contain Errors', value: '80%' },
            { label: 'Avg. Overcharge per Patient', value: '$1,300+' },
            { label: 'Disputes Won with Proper Letters', value: '73%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-white text-2xl sm:text-3xl font-semibold">{stat.value}</p>
              <p className="text-white/50 text-xs sm:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
