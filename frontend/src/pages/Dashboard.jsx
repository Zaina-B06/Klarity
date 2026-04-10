import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, getTasks } from '../api'

const getHealth = (rate) => {
  if (rate >= 80) return { label: 'On Track', color: 'var(--success)', bg: 'var(--success-light)', border: '#10B981' }
  if (rate >= 50) return { label: 'At Risk', color: 'var(--warning)', bg: 'var(--warning-light)', border: '#F59E0B' }
  return { label: 'Needs Attention', color: 'var(--danger)', bg: 'var(--danger-light)', border: '#EF4444' }
}

export default function Dashboard() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getUsers(), getTasks()]).then(([u, t]) => {
      setUsers(u.data.filter(u => u.role === 'employee'))
      setTasks(t.data)
      setLoading(false)
    })
  }, [])

  const getStats = (employeeId) => {
    const assigned = tasks.filter(t => t.assigned_to === employeeId)
    const done = assigned.filter(t => t.status === 'done')
    const inProgress = assigned.filter(t => t.status === 'in_progress')
    const overdue = assigned.filter(t =>
      t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    )
    const rate = assigned.length > 0 ? Math.round((done.length / assigned.length) * 100) : 100
    return { total: assigned.length, done: done.length, pending: assigned.length - done.length - inProgress.length, inProgress: inProgress.length, overdue: overdue.length, rate }
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, letterSpacing: '-0.5px', color: 'var(--text)' }}>Team Overview</h2>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Total Tasks', value: totalTasks, color: 'var(--accent)', bg: 'var(--accent-light)' },
          { label: 'Completed', value: doneTasks, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending', value: pendingTasks, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Overdue', value: overdueTasks, color: 'var(--danger)', bg: 'var(--danger-light)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</p>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              </div>
            </div>
            <p style={{ fontSize: 34, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Employee cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Employees ({users.length})</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {users.map(user => {
          const stats = getStats(user.id)
          const health = getHealth(stats.rate)
          return (
            <div key={user.id} onClick={() => navigate(`/employee/${user.id}`)} style={{              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              borderTop: `3px solid ${health.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, fontFamily: 'Plus Jakarta Sans'
                  }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{user.phone_number}</p>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px',
                  borderRadius: 20, background: health.bg, color: health.color
                }}>
                  {health.label}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Completion rate</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: health.color }}>{stats.rate}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', width: `${stats.rate}%`,
                    background: health.color, borderRadius: 3,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Total', value: stats.total },
                  { label: 'Done', value: stats.done },
                  { label: 'Active', value: stats.inProgress },
                  { label: 'Overdue', value: stats.overdue },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}