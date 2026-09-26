import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import ProjectInfo from './pages/ProjectInfo'

export default function App() {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-bg text-ink">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/project-info" element={<ProjectInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        {!isDashboard && <Footer />}
      </div>
    </MotionConfig>
  )
}
