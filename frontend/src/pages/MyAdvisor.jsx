import { useEffect, useState } from 'react'
import { getTasks } from '../api'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('klarity_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default function MyAdvisor() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState(null)
  const [tasks, setTasks] = useState([])
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    getTasks().then(res => {
      setTasks(res.data.filter(t => t.assigned_to === user.user_id))
    })
  }, [])

  const generateAdvice = async () => {
    setLoading(true)
    setGenerated(false)
    try {
      const res = await api.get(`/advisor/employee/${user.user_id}`)
      setAdvice(res.data)
      setGenerated(true)
    } catch (e) {
      setAdvice({ error: 'Failed to generate advice. Please try again.' })
    }
    setLoading(false)
  }

  const done = tasks.filter(t => t.status === 'done')
  const pending = tasks.filter(t => t.status === 'pending')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const overdue = tasks.filter(t =>
    t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
  )
  const rate = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0

  const getScoreColor = (score) => {
    if (score >= 75) return '#10B981'
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const typeConfig = {
    strength: { color: '#10B981', bg: '#ECFDF5', border: '#10B981', icon: '⭐', label: 'Strength' },
    improve: { color: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B', icon: '📈', label: 'Improve' },
    warning: { color: '#EF4444', bg: '#FEF2F2', border: '#EF4444', icon: '⚠️', label: 'Watch Out' },
    habit: { color: '#4F46E5', bg: '#EEF2FF', border: '#4F46E5', icon: '🔁', label: 'Habit' },
    motivation: { color: '#8B5CF6', bg: '#F5F3FF', border: '#8B5CF6', icon: '🚀', label: 'Motivation' },
    focus: { color: '#0EA5E9', bg: '#F0F9FF', border: '#0EA5E9', icon: '🎯', label: 'Focus' },
  }

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .insight-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .insight-card { transition: all 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 28, letterSpacing: '-0.5px' }}>My AI Coach</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Personal performance insights just for you, {user.name.split(' ')[0]}
          </p>
        </div>
        <button onClick={generateAdvice} disabled={loading} style={{
          background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          color: loading ? 'var(--muted)' : '#fff',
          border: 'none', padding: '12px 28px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(79,70,229,0.3)',
        }}>
          {loading ? '✦ Analyzing...' : generated ? '↺ Refresh' : '✦ Get My Coaching'}
        </button>
      </div>

      {/* Personal stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Tasks', value: tasks.length, bg: 'linear-gradient(135deg, #4F46E5, #7C3AED)', icon: '▦' },
          { label: 'Completed', value: done.length, bg: 'linear-gradient(135deg, #10B981, #059669)', icon: '✓' },
          { label: 'In Progress', value: inProgress.length, bg: 'linear-gradient(135deg, #4F46E5, #6366F1)', icon: '▶' },
          { label: 'Overdue', value: overdue.length, bg: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: '!' },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: bg }} />
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '18px 22px', marginBottom: 28,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Your completion rate</p>
          <p style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: rate >= 70 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444' }}>{rate}%</p>
        </div>
        <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${rate}%`,
            background: rate >= 70 ? 'linear-gradient(90deg, #10B981, #059669)' : rate >= 40 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #DC2626)',
            borderRadius: 4, transition: 'width 0.8s ease'
          }} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '60px 40px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 32, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>✦</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Analyzing your performance...</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Your AI coach is reviewing your work patterns and habits</p>
        </div>
      )}

      {/* Results */}
      {advice && !loading && (
        <div>
          {advice.error ? (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 24, color: '#EF4444' }}>
              {advice.error}
            </div>
          ) : (
            <>
              {/* Summary */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px 28px', marginBottom: 20,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>✦ YOUR PERFORMANCE SUMMARY</div>
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7 }}>{advice.summary}</p>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Your Score</p>
                    <p style={{ fontSize: 48, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: getScoreColor(advice.score), lineHeight: 1 }}>{advice.score}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>out of 100</p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {advice.insights?.map((insight, i) => {
                  const config = typeConfig[insight.type] || typeConfig.focus
                  return (
                    <div key={i} className="insight-card" style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderLeft: `3px solid ${config.border}`,
                      borderRadius: 12, padding: '20px 22px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>{config.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: config.bg, color: config.color, letterSpacing: '0.05em' }}>{config.label.toUpperCase()}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{insight.title}</p>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>{insight.detail}</p>
                      <div style={{ background: config.bg, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: config.color, fontSize: 11, marginTop: 1, flexShrink: 0 }}>→</span>
                        <p style={{ fontSize: 12, fontWeight: 600, color: config.color, lineHeight: 1.5 }}>{insight.tip}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!advice && !loading && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '80px 40px', textAlign: 'center'
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>✦</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your AI Coach is ready</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Get personalized insights about your work habits, strengths, and areas to improve.
          </p>
          <button onClick={generateAdvice} style={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            color: '#fff', border: 'none', padding: '12px 32px',
            borderRadius: 10, fontWeight: 600, fontSize: 14,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
          }}>✦ Get My Coaching</button>
        </div>
      )}
    </div>
  )
}