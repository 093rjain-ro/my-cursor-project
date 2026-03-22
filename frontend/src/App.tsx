import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import StudentDashboard from './pages/StudentDashboard'
import StudentProfile from './pages/StudentProfile'
import EducatorDashboard from './pages/EducatorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { Spinner } from './components/ui'

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <Spinner size={28} />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />
  if (profile && profile.role !== role) {
    const dest = profile.role === 'admin' ? '/admin'
      : profile.role === 'educator' ? '/educator' : '/student'
    return <Navigate to={dest} replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <Spinner size={28} />
      </div>
    )
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={
        user && profile ? (
          <Navigate to={profile.role === 'admin' ? '/admin' : profile.role === 'educator' ? '/educator' : '/student'} replace />
        ) : <AuthPage />
      } />
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
      <Route path="/educator" element={<ProtectedRoute role="educator"><EducatorDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
