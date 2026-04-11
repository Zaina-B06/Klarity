import { useEffect, useState } from 'react'
import { getTasks, getUsers, createTask, deleteTask, remindEmployee, reassignTask } from '../api'
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

const GRID = '12px 1fr 120px 80px 100px 70px 28px 28px 28px'

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
  const [reminding, setReminding] = useState(null)
  const [reassigning, setReassigning] = useState(null)
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '',
    priority: 'medium', deadline: '', created_by: user?.user_id || 1
  })

  const fetchData = () => {
    Promise.all([getTasks(), getUsers()]).then(([t, u]) => {
      setTasks(t.data)
      setUsers(u.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const handleReassign = async (taskId, newAssigneeId) => {
    if (!newAssigneeId) return
    await reassignTask(taskId, parseInt(newAssigneeId))
    setReassigning(null)
    fetchData()
  }

  const handleRemind = async (e, taskId) => {
    e.stopPropagation()
    setReminding(taskId)
    try {
      await remindEmployee(taskId)
      alert('Reminder sent via WhatsApp!')
    } catch {
      alert('Failed to send reminder')
    }
    setReminding(null)
  }

  const employees = users.filter(u => u.role === 'employee')

  const handleSubmit = async () => {
    if (!form.title || !form.assigned_to) return
    setSubmitting(true)
    await createTask({
      ...form,
      assigned_to: parseInt(form.assigned_to),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null
    })
    setForm({ title: '', description: '', assigned_to: '', priority: 'medium', deadline: '', created_by: user?.user_id || 1 })
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
      if (sort === 'due_soon') { if (!a.deadline) return 1; if (!b.deadline) return -1; return new Date(a.deadline) - new Date(b.deadline) }
      if (sort === 'due_late') { if (!a.deadline) return 1; if (!b.deadline) return -1; return new Date(b.deadline) - new Date(a.deadline) }
      if (sort === 'priority') { const o = { high: 0, medium: 1, low: 2 }; return o[a.priority] - o[b.priority] }
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
      <style>{`
        .task-row:hover { background: var(--surface2) !important; }
        .task-row { transition: background 0.15s ease; }
        .delete-btn:hover { background: #FEF2F2 !important; color: #EF4444 !important; border-color: #FECACA !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 28, letterSpacing: '-0.5px' }}>Tasks</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Manage and track your team's work</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          color: '#fff', border: 'none', padding: '11px 22px',
          borderRadius: 10, fontWeight: 600, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
        }}>+ New Task</button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total', value: totalTasks, bg: 'linear-gradient(135deg, #4F46E5, #7C3AED)', icon: '▦' },
          { label: 'In Progress', value: inProgressTasks, bg: 'linear-gradient(135deg, #4F46E5, #6366F1)', icon: '▶' },
          { label: 'Completed', value: doneTasks, bg: 'linear-gradient(135deg, #10B981, #059669)', icon: '✓' },
          { label: 'Overdue', value: overdueTasks, bg: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: '!' },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: bg }} />
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 26, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{value}</p>
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
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Create New Task</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Fill in the details below</p>
            </div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>TASK TITLE *</label>
              <input style={inputStyle} placeholder="What needs to be done?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>DESCRIPTION</label>
              <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} placeholder="Add context or details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>ASSIGN TO *</label>
              <select style={inputStyle} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}{e.department ? ` — ${e.department}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>PRIORITY</label>
              <select style={inputStyle} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>DEADLINE</label>
              <input type="datetime-local" style={inputStyle} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{submitting ? 'Creating...' : 'Create Task'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 5, borderRadius: 10, border: '1px solid var(--border)' }}>
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
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputStyle, width: 190, padding: '8px 14px', fontSize: 13, background: 'var(--surface)' }} placeholder="Search tasks or people..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...inputStyle, width: 150, padding: '8px 14px', fontSize: 13, background: 'var(--surface)', cursor: 'pointer' }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="due_soon">Due soonest</option>
            <option value="due_late">Due latest</option>
            <option value="priority">Priority</option>
          </select>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} style={{ ...inputStyle, width: 150, padding: '8px 14px', fontSize: 13, background: 'var(--surface)', cursor: 'pointer' }}>
            <option value="all">All employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '8px 16px', marginBottom: 6 }}>
        {['', 'Task', 'Assignee', 'Priority', 'Status', 'Due', '', '', ''].map((h, i) => (
          <p key={i} style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</p>
        ))}
      </div>

      {/* Task rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
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
            <div key={task.id} className="task-row"
              onClick={() => navigate(`/employee/${task.assigned_to}`)}
              style={{
                display: 'grid', gridTemplateColumns: GRID,
                gap: 12, alignItems: 'center',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '13px 16px', cursor: 'pointer',
                opacity: task.status === 'done' ? 0.6 : 1,
                borderLeft: isOverdue ? '3px solid #EF4444' : task.status === 'done' ? '3px solid #10B981' : '3px solid transparent',
              }}
            >
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: isOverdue ? '#EF4444' : s.color }} />

              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: 14, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--muted)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                {task.description && <p style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{task.description}</p>}
                {isOverdue && <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444' }}>OVERDUE</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                <span style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.assignee?.name.split(' ')[0]}</span>
              </div>

              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: p.bg, color: p.color, textAlign: 'center', border: `1px solid ${p.color}20` }}>{p.label}</span>

              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: s.bg, color: s.color, textAlign: 'center', border: `1px solid ${s.color}20` }}>{s.label}</span>

              <span style={{ fontSize: 12, color: isOverdue ? '#EF4444' : 'var(--muted)', fontWeight: isOverdue ? 600 : 400 }}>
                {task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
              </span>

              {/* Remind */}
              {task.status !== 'done' ? (
                <button onClick={(e) => handleRemind(e, task.id)} disabled={reminding === task.id} title="Send WhatsApp reminder" style={{ background: reminding === task.id ? 'var(--surface2)' : '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {reminding === task.id ? '...' : '🔔'}
                </button>
              ) : <div />}

              {/* Reassign */}
              {reassigning === task.id ? (
                <select
                  autoFocus
                  defaultValue=""
                  onClick={e => e.stopPropagation()}
                  onChange={e => { e.stopPropagation(); handleReassign(task.id, e.target.value) }}
                  onBlur={() => setReassigning(null)}
                  style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', outline: 'none', width: 28 }}
                >
                  <option value="">→</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setReassigning(task.id) }}
                  title="Reassign task"
                  style={{ background: 'none', border: '1px solid transparent', color: 'var(--muted)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.borderColor = '#C7D2FE' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'transparent' }}
                >↺</button>
              )}

              {/* Delete */}
              <button className="delete-btn" onClick={(e) => handleDelete(e, task.id)} style={{ background: 'none', border: '1px solid transparent', color: 'var(--muted)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>×</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}