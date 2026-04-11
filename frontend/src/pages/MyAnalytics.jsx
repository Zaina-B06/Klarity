import { useEffect, useState } from 'react'
import { getTasks } from '../api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const priorityConfig = {
  high: { color: '#EF4444', bg: '#FEF2F2', label: 'High', order: 0 },
  medium: { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium', order: 1 },
  low: { color: '#10B981', bg: '#ECFDF5', label: 'Low', order: 2 },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const EMPLOYEE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function MyAnalytics() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    getTasks().then(res => {
      const myTasks = res.data.filter(t => t.assigned_to === user.user_id)
      setTasks(myTasks)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Loading...</p>
    </div>
  )

  const done = tasks.filter(t => t.status === 'done')
  const pending = tasks.filter(t => t.status === 'pending')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const overdue = tasks.filter(t =>
    t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
  )
  const rate = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0

  // Priority tasks sorted by deadline
  const priorityTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const pOrder = priorityConfig[a.priority].order - priorityConfig[b.priority].order
      if (pOrder !== 0) return pOrder
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    })

  // Weekly bar chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const weeklyData = last7Days.map(day => ({
    day: DAYS[day.getDay()],
    completed: tasks.filter(t =>
      t.status === 'done' &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === day.toDateString()
    ).length,
    isToday: day.toDateString() === new Date().toDateString()
  }))

  // Calendar
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (m, y) => new Date(y, m, 1).getDay()
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDay(selectedMonth, selectedYear)

  const getTasksForDay = (day) => tasks.filter(t => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d.getDate() === day && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  // Days until deadline helper
  const daysUntil = (deadline) => {
    const diff = new Date(deadline) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const initials = user.name.split(' ').map(n => n[0]).join('')

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '22px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Top bar */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 40px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', height: 60, position: 'sticky', top: 0, zIndex: 10
      }}>
        <h1 style={{ fontSize: 18, color: 'var(--accent)', fontFamily: 'Plus Jakarta Sans' }}>Klarity</h1>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface2)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
  <button onClick={() => navigate('/my-tasks')} style={{
    background: 'transparent', color: 'var(--muted)',
    border: 'none', padding: '6px 18px', borderRadius: 7,
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    fontFamily: 'Inter, sans-serif'
  }}>My Tasks</button>
  <button onClick={() => navigate('/my-analytics')} style={{
    background: 'var(--accent)', color: '#fff',
    border: 'none', padding: '6px 18px', borderRadius: 7,
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
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

      <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, letterSpacing: '-0.5px' }}>My Planner</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, marginBottom: 20 }}>

          {/* Priority focus list */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Priority focus</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Your tasks by urgency and deadline</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {priorityTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
                  <p style={{ fontSize: 24, marginBottom: 8 }}>🎉</p>
                  <p style={{ fontWeight: 600 }}>All caught up!</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>No pending tasks</p>
                </div>
              )}
              {priorityTasks.map(task => {
                const p = priorityConfig[task.priority]
                const isOverdue = task.deadline && new Date(task.deadline) < new Date()
                const days = task.deadline ? daysUntil(task.deadline) : null

                return (
                  <div key={task.id} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: isOverdue ? '#FEF2F2' : 'var(--bg)',
                    border: `1px solid ${isOverdue ? '#FECACA' : 'var(--border)'}`,
                    borderLeft: `3px solid ${p.color}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: p.bg, color: p.color }}>{p.label}</span>
                          {task.deadline && (
                            <span style={{ fontSize: 11, color: isOverdue ? '#EF4444' : days <= 2 ? '#F59E0B' : 'var(--muted)', fontWeight: isOverdue || days <= 2 ? 600 : 400 }}>
                              {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                            </span>
                          )}
                        </div>
                      </div>
                      {task.deadline && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Weekly output chart */}
          <div style={cardStyle}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Weekly output</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Tasks completed each day this week</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barSize={32}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13
                  }}
                />
                <Bar dataKey="completed" name="Completed" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={entry.isToday ? '#4F46E5' : '#C7D2FE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Progress bar */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Overall completion</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: rate >= 80 ? '#10B981' : rate >= 50 ? '#F59E0B' : '#EF4444' }}>{rate}%</p>
              </div>
              <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4 }}>
                <div style={{
                  height: '100%', width: `${rate}%`,
                  background: rate >= 80 ? '#10B981' : rate >= 50 ? '#F59E0B' : '#EF4444',
                  borderRadius: 4, transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
                {[
                  { label: 'In Progress', value: inProgress.length, color: '#4F46E5' },
                  { label: 'Pending', value: pending.length, color: '#F59E0B' },
                  { label: 'Overdue', value: overdue.length, color: '#EF4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '10px', background: 'var(--bg)', borderRadius: 8 }}>
                    <p style={{ fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color }}>{value}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Calendar */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>My deadline calendar</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{MONTHS[selectedMonth]} {selectedYear}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => {
                if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
                else setSelectedMonth(m => m - 1)
              }} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--text)'
              }}>← Prev</button>
              <button onClick={() => {
                if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
                else setSelectedMonth(m => m + 1)
              }} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--text)'
              }}>Next →</button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} style={{ minHeight: 70 }} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dayTasks = getTasksForDay(day)
              const isToday = new Date().getDate() === day && new Date().getMonth() === selectedMonth && new Date().getFullYear() === selectedYear

              return (
                <div key={day} style={{
                  minHeight: 70, padding: '6px',
                  borderRadius: 8, border: '1px solid',
                  borderColor: isToday ? '#4F46E5' : 'var(--border)',
                  background: isToday ? '#EEF2FF' : 'var(--bg)'
                }}>
                  <p style={{
                    fontSize: 12, fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#4F46E5' : 'var(--text)', marginBottom: 3
                  }}>{day}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayTasks.map(task => {
                      const p = priorityConfig[task.priority]
                      const isTaskOverdue = task.status !== 'done' && new Date(task.deadline) < new Date()
                      const isDone = task.status === 'done'
                      const color = isDone ? '#10B981' : isTaskOverdue ? '#EF4444' : p.color
                      const bg = isDone ? '#ECFDF5' : isTaskOverdue ? '#FEF2F2' : p.bg

                      return (
                        <div key={task.id} title={task.title} style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 5px',
                          borderRadius: 3, background: bg, color,
                          borderLeft: `2px solid ${color}`,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{task.title}</div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {[
              { color: '#10B981', bg: '#ECFDF5', label: 'Completed' },
              { color: '#4F46E5', bg: '#EEF2FF', label: 'Upcoming' },
              { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium priority' },
              { color: '#EF4444', bg: '#FEF2F2', label: 'Overdue / High priority' },
            ].map(({ color, bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1px solid ${color}` }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}