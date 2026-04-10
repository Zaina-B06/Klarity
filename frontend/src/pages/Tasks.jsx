import { useEffect, useState } from 'react'
import { getTasks, getUsers, createTask, deleteTask } from '../api'
import { useNavigate } from 'react-router-dom'
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

export default function Tasks() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
const [employeeFilter, setEmployeeFilter] = useState('all')
  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '',
    priority: 'medium', deadline: '', created_by: user?.user_id || 3
  })

  const fetchData = () => {
    Promise.all([getTasks(), getUsers()]).then(([t, u]) => {
      setTasks(t.data)
      setUsers(u.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const employees = users.filter(u => u.role === 'employee')

  const handleSubmit = async () => {
    if (!form.title || !form.assigned_to) return
    setSubmitting(true)
    await createTask({
      ...form,
      assigned_to: parseInt(form.assigned_to),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null
    })
    setForm({ title: '', description: '', assigned_to: '', priority: 'medium', deadline: '', created_by: user?.user_id || 3 })
    setShowForm(false)
    setSubmitting(false)
    fetchData()
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteTask(id)
    fetchData()
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length

  const filters = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
    { key: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { key: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
    { key: 'overdue', label: 'Overdue', count: overdueTasks },
  ]

  const filtered = tasks
  .filter(t => {
    if (filter === 'overdue') return t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    if (filter !== 'all') return t.status === filter
    return true
  })
  .filter(t => employeeFilter === 'all' || t.assigned_to === parseInt(employeeFilter))
  .filter(t => search === '' ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.assignee?.name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
    if (sort === 'due_soon') {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    }
    if (sort === 'due_late') {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(b.deadline) - new Date(a.deadline)
    }
    if (sort === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    }
    return 0
  })
  
  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: 14, outline: 'none',
    fontFamily: 'Inter, sans-serif'
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 26, letterSpacing: '-0.5px' }}>Tasks</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Manage and track your team's work
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: 8, fontWeight: 600,
          fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
        }}>+ New Task</button>
      </div>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 24
      }}>
        {[
          { label: 'Total', value: totalTasks, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'In Progress', value: inProgressTasks, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Completed', value: doneTasks, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Overdue', value: overdueTasks, color: '#EF4444', bg: '#FEF2F2' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 26, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Create task form */}
      {showForm && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 28, marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Create New Task</h3>
            <button onClick={() => setShowForm(false)} style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px'
            }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>TASK TITLE *</label>
              <input style={inputStyle} placeholder="What needs to be done?"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>DESCRIPTION</label>
              <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                placeholder="Add context or details..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>ASSIGN TO *</label>
              <select style={inputStyle} value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>PRIORITY</label>
              <select style={inputStyle} value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>DEADLINE</label>
              <input type="datetime-local" style={inputStyle}
                value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8, fontWeight: 600,
              fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>{submitting ? 'Creating...' : 'Create Task'}</button>
            <button onClick={() => setShowForm(false)} style={{
              background: 'none', color: 'var(--muted)', border: '1px solid var(--border)',
              padding: '10px 20px', borderRadius: 8, fontWeight: 500,
              fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters + Search row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 5, borderRadius: 10, border: '1px solid var(--border)' }}>
          {filters.map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none',
              background: filter === key ? 'var(--accent)' : 'transparent',
              color: filter === key ? '#fff' : 'var(--muted)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s'
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

        <div style={{ display: 'flex', gap: 8 }}>
  {/* Search */}
  <input
    style={{
      ...inputStyle, width: 200, padding: '8px 14px',
      fontSize: 13, background: 'var(--surface)'
    }}
    placeholder="Search tasks or people..."
    value={search}
    onChange={e => setSearch(e.target.value)}
  />

  {/* Sort */}
  <select
    value={sort}
    onChange={e => setSort(e.target.value)}
    style={{
      ...inputStyle, width: 160, padding: '8px 14px',
      fontSize: 13, background: 'var(--surface)', cursor: 'pointer'
    }}
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
    <option value="due_soon">Due soonest</option>
    <option value="due_late">Due latest</option>
    <option value="priority">Priority (high first)</option>
  </select>

  {/* Employee filter */}
  <select
    value={employeeFilter}
    onChange={e => setEmployeeFilter(e.target.value)}
    style={{
      ...inputStyle, width: 160, padding: '8px 14px',
      fontSize: 13, background: 'var(--surface)', cursor: 'pointer'
    }}
  >
    <option value="all">All employees</option>
    {employees.map(e => (
      <option key={e.id} value={e.id}>{e.name}</option>
    ))}
  </select>
</div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '16px 1fr 120px 80px 100px 90px 36px',
        gap: 12, padding: '0 16px', marginBottom: 8
      }}>
        {['', 'Task', 'Assignee', 'Priority', 'Status', 'Due', ''].map((h, i) => (
          <p key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</p>
        ))}
      </div>

      {/* Task rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 40px', color: 'var(--muted)',
            background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: 28, marginBottom: 10 }}>✓</p>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Nothing here</p>
            <p style={{ fontSize: 13 }}>No tasks match this filter</p>
          </div>
        )}
        {filtered.map(task => {
          const p = priorityConfig[task.priority]
          const s = statusConfig[task.status]
          const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date()
          const initials = task.assignee?.name.split(' ').map(n => n[0]).join('')

          return (
            <div key={task.id}
              onClick={() => navigate(`/employee/${task.assigned_to}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '16px 1fr 120px 80px 100px 90px 36px',
                gap: 12, alignItems: 'center',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px',
                cursor: 'pointer', transition: 'box-shadow 0.15s',
                opacity: task.status === 'done' ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isOverdue ? '#EF4444' : s.color
              }} />

              {/* Title */}
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontWeight: 500, fontSize: 14,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  color: task.status === 'done' ? 'var(--muted)' : 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{task.title}</p>
                {isOverdue && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444' }}>OVERDUE</span>
                )}
              </div>

              {/* Assignee */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0
                }}>{initials}</div>
                <span style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.assignee?.name.split(' ')[0]}
                </span>
              </div>

              {/* Priority */}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px',
                borderRadius: 6, background: p.bg, color: p.color,
                textAlign: 'center'
              }}>{p.label}</span>

              {/* Status */}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px',
                borderRadius: 6, background: s.bg, color: s.color,
                textAlign: 'center'
              }}>{s.label}</span>

              {/* Deadline */}
              <span style={{ fontSize: 12, color: isOverdue ? '#EF4444' : 'var(--muted)' }}>
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  : '—'}
              </span>

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(e, task.id)}
                style={{
                  background: 'none', border: '1px solid transparent',
                  color: 'var(--muted)', width: 28, height: 28, borderRadius: 6,
                  cursor: 'pointer', fontSize: 16, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.target.style.background = '#FEF2F2'; e.target.style.color = '#EF4444'; e.target.style.borderColor = '#FECACA' }}
                onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--muted)'; e.target.style.borderColor = 'transparent' }}
              >×</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}