import { ArrowRight } from 'lucide-react'

interface FooterProps {
  onScanClick?: () => void
}

export default function Footer({ onScanClick }: FooterProps) {
  return (
    <footer className="bg-black border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">BillGuard</span>
          </div>
          <p className="text-white/40 text-xs max-w-xs leading-relaxed">
            Fighting medical billing errors for every American. Built for HackAmerica 2026.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {['Privacy Policy', 'Terms of Service', 'HIPAA Notice', 'Contact', 'GitHub'].map(link => (
            <a key={link} href="#" className="text-white/40 hover:text-white text-xs transition-colors">{link}</a>
          ))}
        </div>
        <button onClick={onScanClick} className="group inline-flex items-center gap-2 bg-white text-black rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors">
          Scan a Bill
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-2">
        <p className="text-white/20 text-xs">© 2026 BillGuard. Not a law firm. Not financial advice.</p>
        <p className="text-white/20 text-xs">Made for HackAmerica — America's Largest High School Hackathon</p>
      </div>
    </footer>
  )
}
