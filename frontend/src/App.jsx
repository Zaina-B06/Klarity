import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'
import MyTasks from './pages/MyTasks'
import EmployeeDetail from './pages/EmployeeDetail'
import Landing from './pages/Landing'
import './index.css'

function ManagerLayout({ children }) {
  const { user, logout } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'manager') return <Navigate to="/my-tasks" />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0
      }}>
        <div style={{ padding: '0 12px', marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, color: 'var(--accent)', letterSpacing: '-0.5px' }}>Klarity</h1>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Workforce Intelligence</p>
        </div>

        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', padding: '0 12px', marginBottom: 4 }}>MENU</p>

        {[
          { to: '/dashboard', label: 'Dashboard', icon: '▦' },
          { to: '/tasks', label: 'Tasks', icon: '✓' },
          { to: '/analytics', label: 'Analytics', icon: '∿' },
        ].map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            background: isActive ? 'var(--accent-light)' : 'transparent',
            fontWeight: isActive ? 600 : 400, fontSize: 14, transition: 'all 0.15s'
          })}>
            <span style={{ fontSize: 13 }}>{icon}</span>{label}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Manager</p>
          <p style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{user.name}</p>
          <button onClick={logout} style={{
            marginTop: 10, width: '100%', padding: '8px', borderRadius: 8,
            background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif'
          }}>Logout</button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}

function ProtectedEmployee() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'manager') return <Navigate to="/dashboard" />
  return <MyTasks />
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
          <Route path="/dashboard" element={<ManagerLayout><Dashboard /></ManagerLayout>} />
          <Route path="/tasks" element={<ManagerLayout><Tasks /></ManagerLayout>} />
          <Route path="/analytics" element={<ManagerLayout><Analytics /></ManagerLayout>} />
          <Route path="/employee/:id" element={<ManagerLayout><EmployeeDetail /></ManagerLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}