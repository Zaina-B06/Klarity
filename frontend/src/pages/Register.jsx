import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone_number: '', role: 'employee', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone_number || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await registerUser(form)
      const { token, user_id, name, role } = res.data
      login({ user_id, name, role }, token)
      if (role === 'manager') navigate('/dashboard')
      else navigate('/my-tasks')
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: 15, outline: 'none',
    fontFamily: 'Inter, sans-serif', marginBottom: 16
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, color: 'var(--accent)', marginBottom: 4 }}>Klarity</h1>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Create account</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Join your team workspace</p>
        </div>

        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>FULL NAME</label>
        <input style={inputStyle} placeholder="Your name"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>PHONE NUMBER</label>
        <input style={inputStyle} placeholder="+91XXXXXXXXXX"
          value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />

        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>ROLE</label>
        <select style={{ ...inputStyle, cursor: 'pointer' }}
          value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>

        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>PASSWORD</label>
        <input type="password" style={inputStyle} placeholder="••••••••"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: 8,
          background: 'var(--accent)', color: '#fff', border: 'none',
          fontWeight: 600, fontSize: 15, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', marginBottom: 16
        }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}