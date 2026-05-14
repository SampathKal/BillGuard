import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

interface ShinyTextProps {
  text: string
  className?: string
  speed?: number
}

export default function ShinyText({ text, className = '', speed = 3 }: ShinyTextProps) {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(
      100deg,
      #64CEFB 0%,
      #64CEFB 30%,
      #ffffff 50%,
      #64CEFB 70%,
      #64CEFB 100%
    )`,
    backgroundSize: '200% auto',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  }

  return (
    <motion.span
      className={className}
      style={gradientStyle}
      animate={{ backgroundPosition: ['200% center', '-200% center'] }}
      transition={{
        duration: speed,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      {text}
    </motion.span>
  )
}
