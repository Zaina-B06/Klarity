import { useEffect, useState } from 'react'
import { getTasks, getUsers, createTask, deleteTask, updateTaskStatus } from '../api'
import { useAuth } from '../context/AuthContext'

const priorityConfig = {
  high: { color: '#EF4444', bg: '#FEF2F2', label: 'High' },
  medium: { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium' },
  low: { color: '#10B981', bg: '#ECFDF5', label: 'Low' },
}

const statusConfig = {
  pending: { color: '#6B7280', bg: '#F3F4F6', label: 'Pending' },
  in_progress: { color: '#4edea3', bg: 'rgba(78,222,163,0.12)', label: 'In Progress' },
  done: { color: '#10B981', bg: '#ECFDF5', label: 'Done' },
}

export default function ManagerTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '' })

  const fetchTasks = () => {
    getTasks().then(res => {
      const myTasks = res.data.filter(t => t.assigned_to === user.user_id)
      setTasks(myTasks)
      setLoading(false)
    })
  }

  useEffect(() => { fetchTasks() }, [])

  const handleCreate = async () => {
    if (!form.title) return
    setSubmitting(true)
    await createTask({
      title: form.title,
      description: form.description,
      assigned_to: user.user_id,
      created_by: user.user_id,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null
    })
    setForm({ title: '', description: '', priority: 'medium', deadline: '' })
    setShowForm(false)
    setSubmitting(false)
    fetchTasks()
  }

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdating(taskId)
    await updateTaskStatus(taskId, newStatus)
    await fetchTasks()
    setUpdating(null)
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    await deleteTask(taskId)
    fetchTasks()
  }

  const done = tasks.filter(t => t.status === 'done')
  const pending = tasks.filter(t => t.status === 'pending')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const overdue = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date())
  const rate = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    if (filter !== 'all') return t.status === filter
    return true
  }).sort((a, b) => {
    const order = { in_progress: 0, pending: 1, done: 2 }
    return order[a.status] - order[b.status]
  })

  const filters = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'in_progress', label: 'In Progress', count: inProgress.length },
    { key: 'done', label: 'Done', count: done.length },
    { key: 'overdue', label: 'Overdue', count: overdue.length },
  ]

  const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: 'Inter, sans-serif'
}

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>

  return (
    <div>
      <style>{`
        .task-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important; }
        .task-card { transition: all 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 26, letterSpacing: '-0.5px' }}>My Tasks</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Your personal task list</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#4edea3', color: '#003824', border: 'none',
          padding: '10px 22px', borderRadius: 9, fontWeight: 700,
          fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          boxShadow: '0 4px 14px rgba(78,222,163,0.3)'
        }}>+ New Task</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: tasks.length, bg: 'linear-gradient(135deg, #4edea3, #10B981)', icon: '▦' },
          { label: 'Done', value: done.length, bg: 'linear-gradient(135deg, #10B981, #059669)', icon: '✓' },
          { label: 'In Progress', value: inProgress.length, bg: 'linear-gradient(135deg, #7bd0ff, #4F46E5)', icon: '▶' },
          { label: 'Overdue', value: overdue.length, bg: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: '!' },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            position: 'relative', overflow: 'hidden'
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
        borderRadius: 12, padding: '16px 20px', marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Overall completion</p>
          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: rate >= 70 ? '#4edea3' : rate >= 40 ? '#F59E0B' : '#ef4444' }}>{rate}%</p>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${rate}%`, background: rate >= 70 ? '#4edea3' : rate >= 40 ? '#F59E0B' : '#ef4444', borderRadius: 3, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Create task form */}
      {showForm && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24, marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 700 }}>Create New Task</p>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em' }}>TASK TITLE *</label>
              <input style={inputStyle} placeholder="What needs to be done?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em' }}>DESCRIPTION</label>
              <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} placeholder="Add details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em' }}>PRIORITY</label>
              <select style={inputStyle} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em' }}>DEADLINE</label>
              <input type="datetime-local" style={inputStyle} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={handleCreate} disabled={submitting} style={{ background: '#4edea3', color: '#003824', border: 'none', padding: '9px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', padding: '9px 16px', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 5, borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', width: 'fit-content', marginBottom: 16 }}>
        {filters.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '6px 14px', borderRadius: 7, border: 'none',
            background: filter === key ? '#4edea3' : 'transparent',
            color: filter === key ? '#003824' : 'var(--muted)',
            fontSize: 13, fontWeight: filter === key ? 700 : 500,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {label}
            <span style={{ background: filter === key ? 'rgba(0,56,36,0.2)' : 'var(--surface2)', fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 8, color: filter === key ? '#003824' : 'var(--muted)' }}>{count}</span>
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
              borderLeft: isOverdue ? '3px solid #ef4444' : task.status === 'done' ? '3px solid #4edea3' : '3px solid transparent',
              opacity: task.status === 'done' ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 600, fontSize: 15, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--muted)' : 'var(--text)' }}>{task.title}</p>
                    {isOverdue && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '2px 7px', borderRadius: 4 }}>OVERDUE</span>}
                  </div>
                  {task.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{task.description}</p>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: p.bg, color: p.color }}>{p.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color }}>{s.label}</span>
                    {task.deadline && <span style={{ fontSize: 12, color: isOverdue ? '#ef4444' : 'var(--muted)', fontWeight: isOverdue ? 600 : 400 }}>Due {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {task.status !== 'done' && (
                    <>
                      {task.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(task.id, 'in_progress')} disabled={isUpdating} style={{ background: 'rgba(123,208,255,0.12)', color: '#7bd0ff', border: '1px solid rgba(123,208,255,0.2)', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                          {isUpdating ? '...' : '▶ Start'}
                        </button>
                      )}
                      <button onClick={() => handleStatusUpdate(task.id, 'done')} disabled={isUpdating} style={{ background: '#4edea3', color: '#003824', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 8px rgba(78,222,163,0.25)' }}>
                        {isUpdating ? '...' : '✓ Done'}
                      </button>
                    </>
                  )}
                  {task.status === 'done' && <span style={{ fontSize: 18, color: '#4edea3' }}>✓</span>}
                  <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--muted)' }}
                  >×</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}