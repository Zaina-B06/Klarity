import { useEffect, useState } from 'react'
import { getTasks, updateTaskStatus } from '../api'
import { useAuth } from '../context/AuthContext'

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
  const { user } = useAuth()
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

  const getHealth = (r) => {
    if (r >= 80) return { label: 'On Track', color: '#10B981', bg: '#ECFDF5' }
    if (r >= 50) return { label: 'At Risk', color: '#F59E0B', bg: '#FFFBEB' }
    return { label: 'Needs Attention', color: '#EF4444', bg: '#FEF2F2' }
  }
  const health = getHealth(rate)

  const filters = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'in_progress', label: 'In Progress', count: inProgress.length },
    { key: 'done', label: 'Done', count: done.length },
    { key: 'overdue', label: 'Overdue', count: overdue.length },
  ]

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    if (filter !== 'all') return t.status === filter
    return true
  }).sort((a, b) => {
    const order = { in_progress: 0, pending: 1, done: 2 }
    return order[a.status] - order[b.status]
  })

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading your tasks...</p>

  return (
    <div>
      <style>{`
        .task-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
        .task-card { transition: all 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 26, letterSpacing: '-0.5px' }}>My Tasks</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          background: health.bg, border: `1px solid ${health.color}30`,
          borderRadius: 10, padding: '8px 16px', textAlign: 'center'
        }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Health</p>
          <p style={{ fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: health.color }}>{rate}%</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: tasks.length, bg: 'linear-gradient(135deg, #4F46E5, #7C3AED)', icon: '▦' },
          { label: 'Done', value: done.length, bg: 'linear-gradient(135deg, #10B981, #059669)', icon: '✓' },
          { label: 'In Progress', value: inProgress.length, bg: 'linear-gradient(135deg, #4F46E5, #6366F1)', icon: '▶' },
          { label: 'Overdue', value: overdue.length, bg: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: '!' },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px',
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
        borderRadius: 12, padding: '18px 22px', marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Overall completion</p>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: health.bg, color: health.color }}>{health.label}</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: health.color }}>{rate}%</p>
        </div>
        <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${rate}%`,
            background: `linear-gradient(90deg, ${health.color}, ${health.color}99)`,
            borderRadius: 4, transition: 'width 0.8s ease'
          }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 5, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content', marginBottom: 16 }}>
        {filters.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '6px 14px', borderRadius: 7, border: 'none',
            background: filter === key ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'transparent',
            color: filter === key ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6
          }}>
            {label}
            <span style={{ background: filter === key ? 'rgba(255,255,255,0.25)' : 'var(--surface2)', fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 8, color: filter === key ? '#fff' : 'var(--muted)' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>✓</p>
            <p style={{ fontWeight: 600 }}>All clear!</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>No tasks in this category</p>
          </div>
        )}
        {filtered.map(task => {
          const p = priorityConfig[task.priority]
          const s = statusConfig[task.status]
          const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date()
          const isUpdating = updating === task.id

          return (
            <div key={task.id} className="task-card" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '18px 20px',
              borderLeft: isOverdue ? '3px solid #EF4444' : task.status === 'done' ? '3px solid #10B981' : '3px solid transparent',
              opacity: task.status === 'done' ? 0.7 : 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 600, fontSize: 15, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--muted)' : 'var(--text)' }}>{task.title}</p>
                    {isOverdue && <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '2px 7px', borderRadius: 4 }}>OVERDUE</span>}
                  </div>
                  {task.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{task.description}</p>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: p.bg, color: p.color, border: `1px solid ${p.color}20` }}>{p.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.color}20` }}>{s.label}</span>
                    {task.deadline && <span style={{ fontSize: 12, color: isOverdue ? '#EF4444' : 'var(--muted)', fontWeight: isOverdue ? 600 : 400 }}>Due {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>

                {task.status !== 'done' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {task.status === 'pending' && (
                      <button onClick={() => handleStatusUpdate(task.id, 'in_progress')} disabled={isUpdating} style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        {isUpdating ? '...' : '▶ Start'}
                      </button>
                    )}
                    <button onClick={() => handleStatusUpdate(task.id, 'done')} disabled={isUpdating} style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                      {isUpdating ? '...' : '✓ Done'}
                    </button>
                  </div>
                )}
                {task.status === 'done' && <span style={{ fontSize: 20, flexShrink: 0, color: '#10B981' }}>✓</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}