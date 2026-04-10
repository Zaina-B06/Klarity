import { useEffect, useState } from 'react'
import { getTasks } from '../api'
import { useAuth } from '../context/AuthContext'

const statusStyle = {
  pending: { color: '#6B7280', bg: '#F3F4F6' },
  in_progress: { color: '#4F46E5', bg: '#EEF2FF' },
  done: { color: '#10B981', bg: '#ECFDF5' },
}

const priorityStyle = {
  high: { color: '#EF4444', bg: '#FEF2F2' },
  medium: { color: '#F59E0B', bg: '#FFFBEB' },
  low: { color: '#10B981', bg: '#ECFDF5' },
}

export default function MyTasks() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTasks().then(res => {
      const myTasks = res.data.filter(t => t.assigned_to === user.user_id)
      setTasks(myTasks)
      setLoading(false)
    })
  }, [])

  const done = tasks.filter(t => t.status === 'done').length
  const pending = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length

  if (loading) return <p style={{ padding: 40, color: 'var(--muted)' }}>Loading...</p>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h1 style={{ fontSize: 20, color: 'var(--accent)' }}>Klarity</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Hi, {user.name}</span>
          <button onClick={logout} style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            fontFamily: 'Inter, sans-serif'
          }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, letterSpacing: '-0.5px' }}>My Tasks</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Your assigned work</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32, maxWidth: 600 }}>
          {[
            { label: 'Pending', value: pending, color: '#F59E0B' },
            { label: 'In Progress', value: inProgress, color: '#4F46E5' },
            { label: 'Done', value: done, color: '#10B981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 28, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 700 }}>
          {tasks.length === 0 && (
            <div style={{
              textAlign: 'center', padding: 60, color: 'var(--muted)',
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              No tasks assigned yet.
            </div>
          )}
          {tasks.map(task => {
            const s = statusStyle[task.status]
            const p = priorityStyle[task.priority]
            const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date()
            return (
              <div key={task.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '18px 24px',
                borderLeft: isOverdue ? '3px solid #EF4444' : '3px solid transparent',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{task.title}</p>
                    {task.description && (
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{task.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: p.bg, color: p.color }}>
                        {task.priority}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.deadline && (
                        <span style={{ fontSize: 12, color: isOverdue ? '#EF4444' : 'var(--muted)' }}>
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {isOverdue && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>OVERDUE</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}