import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function EmployeeLayout({ children }) {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('klarity_theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('klarity_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const initials = user.name.split(' ').map(n => n[0]).join('')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 240, background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '0', display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Top — logo + dark mode */}
        <div style={{
          padding: '24px 20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: 20, color: 'var(--accent)', letterSpacing: '-0.5px', fontFamily: 'Plus Jakarta Sans' }}>Klarity</h1>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Workforce Intelligence</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0
          }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: '16px 12px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>MENU</p>
          {[
            { to: '/my-tasks', label: 'My Tasks', icon: '✓' },
            { to: '/my-analytics', label: 'My Analytics', icon: '∿' },
            { to: '/my-advisor', label: 'My Coach', icon: '✦' },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 14,
              transition: 'all 0.15s', marginBottom: 2
            })}>
              <span style={{ fontSize: 13 }}>{icon}</span>{label}
            </NavLink>
          ))}
        </div>

        {/* Bottom — user + logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{user.department || 'Employee'}</p>
          </div>
          <button onClick={logout} title="Logout" style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 7, width: 30, height: 30, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 14, flexShrink: 0,
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >→</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}