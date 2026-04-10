import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTasks, getUsers } from '../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

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

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getUsers(), getTasks()]).then(([u, t]) => {
      const emp = u.data.find(u => u.id === parseInt(id))
      const empTasks = t.data.filter(t => t.assigned_to === parseInt(id))
      setEmployee(emp)
      setTasks(empTasks)
      setLoading(false)
    })
  }, [id])

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>
  if (!employee) return <p style={{ color: 'var(--muted)' }}>Employee not found</p>

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

  const chartData = [
    { name: 'Done', value: done.length, color: '#10B981' },
    { name: 'In Progress', value: inProgress.length, color: '#4F46E5' },
    { name: 'Pending', value: pending.length, color: '#F59E0B' },
    { name: 'Overdue', value: overdue.length, color: '#EF4444' },
  ]

  const filtered = filter === 'all' ? tasks : tasks.filter(t =>
    filter === 'overdue'
      ? t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
      : t.status === filter
  )

  const initials = employee.name.split(' ').map(n => n[0]).join('')

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate('/dashboard')} style={{
        background: 'none', border: 'none', color: 'var(--muted)',
        cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: 0
      }}>
        ← Back to Dashboard
      </button>

      {/* Employee header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent-light)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', flexShrink: 0
        }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, letterSpacing: '-0.5px' }}>{employee.name}</h2>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '4px 12px',
              borderRadius: 20, background: health.bg, color: health.color
            }}>{health.label}</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{employee.phone_number}</p>
        </div>
        {/* Completion rate circle */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            color: health.color, lineHeight: 1
          }}>{rate}%</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>completion rate</p>
        </div>
      </div>

      {/* Stats + Chart row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 20 }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Total', value: tasks.length, color: 'var(--accent)' },
            { label: 'Done', value: done.length, color: '#10B981' },
            { label: 'In Progress', value: inProgress.length, color: '#4F46E5' },
            { label: 'Overdue', value: overdue.length, color: '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 30, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Task breakdown</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Distribution across statuses</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 13
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Overall completion</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: health.color }}>{rate}%</p>
        </div>
        <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4 }}>
          <div style={{
            height: '100%', width: `${rate}%`, background: health.color,
            borderRadius: 4, transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Tasks ({tasks.length})</h3>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 5, borderRadius: 10, border: '1px solid var(--border)' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'done', label: 'Done' },
            { key: 'overdue', label: 'Overdue' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '5px 12px', borderRadius: 7, border: 'none',
              background: filter === key ? 'var(--accent)' : 'transparent',
              color: filter === key ? '#fff' : 'var(--muted)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px', color: 'var(--muted)',
            background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)'
          }}>No tasks in this category</div>
        )}
        {filtered.map(task => {
          const p = priorityConfig[task.priority]
          const s = statusConfig[task.status]
          const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date()
          return (
            <div key={task.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: task.status === 'done' ? 0.65 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isOverdue ? '#EF4444' : s.color, flexShrink: 0
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 600, fontSize: 14,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  color: task.status === 'done' ? 'var(--muted)' : 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{task.title}</p>
                {task.description && (
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</p>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: p.bg, color: p.color, flexShrink: 0 }}>{p.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color, flexShrink: 0, minWidth: 76, textAlign: 'center' }}>{s.label}</span>
              {task.deadline && (
                <span style={{ fontSize: 12, color: isOverdue ? '#EF4444' : 'var(--muted)', flexShrink: 0 }}>
                  {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {isOverdue && <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>OVERDUE</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}