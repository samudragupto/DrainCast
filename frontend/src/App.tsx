import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'

export default function App() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-bg text-ink">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </MotionConfig>
  )
}
