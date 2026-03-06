import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './pages/LoginScreen'
import RegisterScreen from './pages/RegisterScreen'
import HomeScreen from './pages/HomeScreen'
import DiaryScreen from './pages/DiaryScreen'
import LandingScreen from './pages/LandingScreen'
import CustomCursor from './components/ui/CustomCursor'

function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()

  const Loader = () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'IM Fell English', serif", fontSize: 28, color: '#2a2a2a', letterSpacing: 4 }}>drafts.</p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1A6BFF', animation: `blink 1.2s ${d}s ease infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (location.pathname === '/' && !user && !loading) return <LandingScreen />
  if (location.pathname === '/' && !user && loading) return <LandingScreen />
  if (location.pathname === '/' && user) return <HomeScreen />

  if (loading) return <Loader />

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <RegisterScreen /> : <Navigate to="/" replace />} />
      <Route path="/diary/:id" element={user ? <DiaryScreen /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <CustomCursor tool="" color="#6c63ff" />
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  )
}
