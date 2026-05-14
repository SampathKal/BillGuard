import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = ['Home', 'How It Works', 'Features', 'Legal', 'Blog', 'Contact us']

interface NavbarProps {
  onScanClick?: () => void
}

export default function Navbar({ onScanClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="relative z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">BillGuard</span>
        </div>

        <div className="hidden lg:flex items-center gap-0.5 border border-gray-700 rounded-full px-3 py-2 bg-black/30 backdrop-blur-sm">
          {navLinks.map((link, i) => (
            <a key={link} href="#" className="flex items-center gap-1 px-3 py-1 text-sm text-white/80 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10">
              {link}
              {i === navLinks.length - 1 && <ArrowRight size={13} />}
            </a>
          ))}
        </div>

        <button
          onClick={onScanClick}
          className="hidden lg:flex items-center gap-1.5 bg-white text-black rounded-full px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Scan a Bill
        </button>

        <button className="lg:hidden text-white/80 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-gray-800 z-50"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a key={link} href="#" className="flex items-center justify-between px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                  {link}
                  {i === navLinks.length - 1 && <ArrowRight size={14} />}
                </a>
              ))}
              <button onClick={() => { setMenuOpen(false); onScanClick?.() }} className="mt-2 bg-white text-black rounded-xl py-3 text-sm font-medium">
                Scan a Bill Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
