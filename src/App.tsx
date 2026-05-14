import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import BillScanner from './components/BillScanner'
import Legal from './components/Legal'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 z-30">
          <Navbar />
        </div>
        <Hero />
      </div>

      <HowItWorks />
      <Features />

      {/* THE ACTUAL APP */}
      <BillScanner />

      <Legal />
      <Footer />
    </div>
  )
}
