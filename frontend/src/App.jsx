import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'
import MyTasks from './pages/MyTasks'
import Landing from './pages/Landing'
import EmployeeDetail from './pages/EmployeeDetail'
import MyAnalytics from './pages/MyAnalytics'
import AIAdvisor from './pages/AIAdvisor'
import MyAdvisor from './pages/MyAdvisor'
import EmployeeLayout from './components/EmployeeLayout'
import ManagerTasks from './pages/ManagerTasks'
import Report from './pages/Report'
import './index.css'

function ManagerLayout({ children }) {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('klarity_theme') !== 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('klarity_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  if (!user) return <Navigate to="/login" />
  if (user.role !== 'manager') return <Navigate to="/my-tasks" />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        width: 240, background: '#0d1528',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 20, color: '#4edea3', letterSpacing: '-0.5px', fontFamily: 'Plus Jakarta Sans' }}>Klarity</h1>
              <p style={{ fontSize: 10, color: 'rgba(218,226,253,0.35)', marginTop: 1, letterSpacing: '0.05em' }}>INTELLIGENCE IN MOTION</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15
            }}>{darkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>

        <div style={{ padding: '16px 12px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(218,226,253,0.3)', letterSpacing: '0.1em', padding: '0 10px', marginBottom: 8 }}>MENU</p>
          {[
            { to: '/dashboard', label: 'Dashboard', icon: '▦' },
            { to: '/tasks', label: 'Tasks', icon: '✓' },
            { to: '/analytics', label: 'Analytics', icon: '∿' },
            { to: '/advisor', label: 'AI Advisor', icon: '✦' },
            { to: '/my-tasks-manager', label: 'My Tasks', icon: '◈' },
            { to: '/report', label: 'Report', icon: '↓' },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9, textDecoration: 'none',
              color: isActive ? '#4edea3' : 'rgba(218,226,253,0.5)',
              background: isActive ? 'rgba(78,222,163,0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 14,
              transition: 'all 0.15s', marginBottom: 2,
              border: isActive ? '1px solid rgba(78,222,163,0.15)' : '1px solid transparent'
            })}>
              <span style={{ fontSize: 13 }}>{icon}</span>{label}
            </NavLink>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(78,222,163,0.15)', color: '#4edea3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0, border: '1px solid rgba(78,222,163,0.2)'
          }}>{user.name.split(' ').map(n => n[0]).join('')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(218,226,253,0.35)' }}>Manager</p>
          </div>
          <button onClick={logout} title="Logout" style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 7, width: 30, height: 30, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(218,226,253,0.4)', fontSize: 14, transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(218,226,253,0.4)' }}
          >→</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '36px 48px', overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}

function ProtectedEmployee() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'manager') return <Navigate to="/dashboard" />
  return <EmployeeLayout><MyTasks /></EmployeeLayout>
}

function ProtectedEmployeeAnalytics() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'manager') return <Navigate to="/dashboard" />
  return <EmployeeLayout><MyAnalytics /></EmployeeLayout>
}

function ProtectedEmployeeAdvisor() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'manager') return <Navigate to="/dashboard" />
  return <EmployeeLayout><MyAdvisor /></EmployeeLayout>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-tasks" element={<ProtectedEmployee />} />
          <Route path="/my-analytics" element={<ProtectedEmployeeAnalytics />} />
          <Route path="/my-advisor" element={<ProtectedEmployeeAdvisor />} />
          <Route path="/dashboard" element={<ManagerLayout><Dashboard /></ManagerLayout>} />
          <Route path="/tasks" element={<ManagerLayout><Tasks /></ManagerLayout>} />
          <Route path="/analytics" element={<ManagerLayout><Analytics /></ManagerLayout>} />
          <Route path="/advisor" element={<ManagerLayout><AIAdvisor /></ManagerLayout>} />
          <Route path="/employee/:id" element={<ManagerLayout><EmployeeDetail /></ManagerLayout>} />
          <Route path="/my-tasks-manager" element={<ManagerLayout><ManagerTasks /></ManagerLayout>} />
          <Route path="/report" element={<ManagerLayout><Report /></ManagerLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}