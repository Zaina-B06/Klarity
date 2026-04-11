import { useEffect, useState } from 'react'
import { getTasks, updateTaskStatus } from '../api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const priorityConfig = {
  high: { color: '#EF4444', bg: '#FEF2F2', label: 'High' },
  medium: { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium' },
  low: { color: '#10B981', bg: '#ECFDF5', label: 'Low' },
}

const statusConfig = {
  pending: { color: '#6B7280', bg: '#F3F4F6', label: 'Pending' },
  in_progress: { color: '#4F46E5', bg: '#EEF2FF', label: 'In Progress' },
  done: { color: '#10B981', bg: '#ECFDF5', label: 'Done' },
}

export default function MyTasks() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  const fetchTasks = () => {
    getTasks().then(res => {
      const myTasks = res.data.filter(t => t.assigned_to === user.user_id)
      setTasks(myTasks)
      setLoading(false)
    })
  }

  useEffect(() => { fetchTasks() }, [])

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdating(taskId)
    await updateTaskStatus(taskId, newStatus)
    await fetchTasks()
    setUpdating(null)
  }

  const done = tasks.filter(t => t.status === 'done')
  const pending = tasks.filter(t => t.status === 'pending')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const overdue = tasks.filter(t =>
    t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
  )
  const rate = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    if (filter !== 'all') return t.status === filter
    return true
  })

  const initials = user.name.split(' ').map(n => n[0]).join('')

  const getHealth = (r) => {
    if (r >= 80) return { label: 'On Track', color: '#10B981', bg: '#ECFDF5' }
    if (r >= 50) return { label: 'At Risk', color: '#F59E0B', bg: '#FFFBEB' }
    return { label: 'Needs Attention', color: '#EF4444', bg: '#FEF2F2' }
  }
  const health = getHealth(rate)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Loading your tasks...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <div style={{
  background: 'var(--surface)', borderBottom: '1px solid var(--border)',
  padding: '0 40px', display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', height: 60
}}>
  <h1 style={{ fontSize: 18, color: 'var(--accent)', fontFamily: 'Plus Jakarta Sans' }}>Klarity</h1>
  
  <div style={{ display: 'flex', gap: 6, background: 'var(--surface2)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
    <button onClick={() => navigate('/my-tasks')} style={{
      background: 'var(--accent)', color: '#fff',
      border: 'none', padding: '6px 18px', borderRadius: 7,
      cursor: 'pointer', fontSize: 13, fontWeight: 600,
      fontFamily: 'Inter, sans-serif'
    }}>My Tasks</button>
    <button onClick={() => navigate('/my-analytics')} style={{
      background: 'transparent', color: 'var(--muted)',
      border: 'none', padding: '6px 18px', borderRadius: 7,
      cursor: 'pointer', fontSize: 13, fontWeight: 500,
      fontFamily: 'Inter, sans-serif'
    }}>My Analytics</button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--accent-light)', color: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700
    }}>{initials}</div>
    <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</span>
    <button onClick={logout} style={{
      background: 'none', border: '1px solid var(--border)',
      color: 'var(--muted)', padding: '6px 14px', borderRadius: 8,
      cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif'
    }}>Logout</button>
  </div>
</div>

      <div style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, letterSpacing: '-0.5px' }}>My Tasks</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: tasks.length, color: '#4F46E5', bg: '#EEF2FF' },
            { label: 'Done', value: done.length, color: '#10B981', bg: '#ECFDF5' },
            { label: 'In Progress', value: inProgress.length, color: '#4F46E5', bg: '#EEF2FF' },
            { label: 'Overdue', value: overdue.length, color: '#EF4444', bg: '#FEF2F2' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 28, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 22px', marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>My completion rate</p>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px',
                borderRadius: 20, background: health.bg, color: health.color
              }}>{health.label}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: health.color }}>{rate}%</p>
          </div>
          <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4 }}>
            <div style={{
              height: '100%', width: `${rate}%`,
              background: health.color, borderRadius: 4,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 6, background: 'var(--surface)',
          padding: 5, borderRadius: 10, border: '1px solid var(--border)',
          width: 'fit-content', marginBottom: 16
        }}>
          {[
            { key: 'all', label: 'All', count: tasks.length },
            { key: 'pending', label: 'Pending', count: pending.length },
            { key: 'in_progress', label: 'In Progress', count: inProgress.length },
            { key: 'done', label: 'Done', count: done.length },
            { key: 'overdue', label: 'Overdue', count: overdue.length },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none',
              background: filter === key ? 'var(--accent)' : 'transparent',
              color: filter === key ? '#fff' : 'var(--muted)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6
            }}>
              {label}
              <span style={{
                background: filter === key ? 'rgba(255,255,255,0.25)' : 'var(--surface2)',
                fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 8,
                color: filter === key ? '#fff' : 'var(--muted)'
              }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px', color: 'var(--muted)',
              background: 'var(--surface)', borderRadius: 12,
              border: '1px solid var(--border)'
            }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>✓</p>
              <p style={{ fontWeight: 600 }}>All clear here</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>No tasks in this category</p>
            </div>
          )}
          {filtered.map(task => {
            const p = priorityConfig[task.priority]
            const s = statusConfig[task.status]
            const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date()
            const isUpdating = updating === task.id

            return (
              <div key={task.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '18px 20px',
                borderLeft: isOverdue ? '3px solid #EF4444' : task.status === 'done' ? '3px solid #10B981' : '3px solid transparent',
                opacity: task.status === 'done' ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <p style={{
                        fontWeight: 600, fontSize: 15,
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        color: task.status === 'done' ? 'var(--muted)' : 'var(--text)'
                      }}>{task.title}</p>
                      {isOverdue && <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '2px 7px', borderRadius: 4 }}>OVERDUE</span>}
                    </div>
                    {task.description && (
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{task.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: p.bg, color: p.color }}>{p.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color }}>{s.label}</span>
                      {task.deadline && (
                        <span style={{ fontSize: 12, color: isOverdue ? '#EF4444' : 'var(--muted)' }}>
                          Due {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {task.status !== 'done' && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                          disabled={isUpdating}
                          style={{
                            background: '#EEF2FF', color: '#4F46E5',
                            border: '1px solid #C7D2FE', padding: '8px 14px',
                            borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                          }}>
                          {isUpdating ? '...' : 'Start'}
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'done')}
                        disabled={isUpdating}
                        style={{
                          background: '#ECFDF5', color: '#10B981',
                          border: '1px solid #A7F3D0', padding: '8px 14px',
                          borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                        }}>
                        {isUpdating ? '...' : 'Mark Done'}
                      </button>
                    </div>
                  )}

                  {task.status === 'done' && (
                    <span style={{ fontSize: 20, flexShrink: 0 }}>✓</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}