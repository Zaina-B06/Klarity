import { useEffect, useState } from 'react'
import { getTasks, getUsers } from '../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid, Legend,
  PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const COLORS = {
  done: '#10B981',
  in_progress: '#4F46E5',
  pending: '#F59E0B',
  overdue: '#EF4444',
}

const EMPLOYEE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '8px 12px', fontSize: 13,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <p style={{ color: payload[0].payload.color, fontWeight: 600 }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    Promise.all([getTasks(), getUsers()]).then(([t, u]) => {
      setTasks(t.data)
      setUsers(u.data.filter(u => u.role === 'employee'))
      setLoading(false)
    })
  }, [])

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>

  const employeeStats = users.map((user, idx) => {
    const assigned = tasks.filter(t => t.assigned_to === user.id)
    const done = assigned.filter(t => t.status === 'done').length
    const inProgress = assigned.filter(t => t.status === 'in_progress').length
    const pending = assigned.filter(t => t.status === 'pending').length
    const overdue = assigned.filter(t =>
      t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    ).length
    const rate = assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0
    return {
      name: user.name.split(' ')[0],
      fullName: user.name,
      id: user.id,
      done, inProgress, pending, overdue, rate,
      total: assigned.length,
      color: EMPLOYEE_COLORS[idx % EMPLOYEE_COLORS.length]
    }
  })

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const overallRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const statusData = [
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: COLORS.done },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: COLORS.in_progress },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: COLORS.pending },
    { name: 'Overdue', value: tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length, color: COLORS.overdue },
  ]

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10B981' },
  ]

  // Productivity line chart — tasks completed per employee over days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const productivityData = last7Days.map(day => {
    const dayStr = day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const entry = { day: dayStr }
    users.forEach((user, idx) => {
      const name = user.name.split(' ')[0]
      entry[name] = tasks.filter(t =>
        t.assigned_to === user.id &&
        t.status === 'done' &&
        t.completed_at &&
        new Date(t.completed_at).toDateString() === day.toDateString()
      ).length
    })
    return entry
  })

  // Radar chart data
  const radarData = employeeStats.map(e => ({
    name: e.name,
    Completion: e.rate,
    'On Time': e.total > 0 ? Math.round(((e.done) / e.total) * 100) : 0,
    Output: Math.min(100, e.total * 10),
  }))

  // Calendar data
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)

  const getTasksForDay = (day) => {
    const date = new Date(selectedYear, selectedMonth, day)
    return tasks.filter(t => {
      if (!t.deadline) return false
      const deadline = new Date(t.deadline)
      return deadline.getDate() === day &&
        deadline.getMonth() === selectedMonth &&
        deadline.getFullYear() === selectedYear
    })
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }

  const tabs = ['overview', 'productivity', 'calendar']

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, letterSpacing: '-0.5px' }}>Analytics</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Team performance insights</p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex', gap: 6, background: 'var(--surface)',
        padding: 5, borderRadius: 10, border: '1px solid var(--border)',
        width: 'fit-content', marginBottom: 24
      }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 20px', borderRadius: 7, border: 'none',
            background: activeTab === tab ? 'var(--accent)' : 'transparent',
            color: activeTab === tab ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
            transition: 'all 0.15s'
          }}>{tab}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>

          {/* Completion rate bar + Pie side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={cardStyle}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Completion rate by employee</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>% of assigned tasks marked done</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={employeeStats} barSize={44}>
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rate" name="Completion %" radius={[8, 8, 0, 0]}>
                    {employeeStats.map((entry, i) => (
                      <Cell key={i} fill={entry.rate >= 80 ? '#10B981' : entry.rate >= 50 ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Task status breakdown</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Overall distribution</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {statusData.map(({ name, color, value }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{name} ({value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task breakdown grouped bar + Priority pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={cardStyle}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Task breakdown by employee</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Done, in progress, pending, overdue</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={employeeStats} barSize={14} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="done" name="Done" fill={COLORS.done} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill={COLORS.in_progress} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdue" name="Overdue" fill={COLORS.overdue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Tasks by priority</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>High, medium, low split</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%" cy="50%"
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {priorityData.map(({ name, color, value }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{name} ({value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance table */}
          <div style={cardStyle}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Employee performance summary</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Employee', 'Total', 'Done', 'In Progress', 'Pending', 'Overdue', 'Rate'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px', fontSize: 11,
                      fontWeight: 600, color: 'var(--muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employeeStats.map((e, i) => (
                  <tr key={e.fullName} style={{ borderBottom: i < employeeStats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color }} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{e.fullName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 14 }}>{e.total}</td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#10B981', fontWeight: 500 }}>{e.done}</td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#4F46E5', fontWeight: 500 }}>{e.inProgress}</td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#F59E0B', fontWeight: 500 }}>{e.pending}</td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#EF4444', fontWeight: 500 }}>{e.overdue}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3 }}>
                          <div style={{
                            height: '100%', width: `${e.rate}%`, borderRadius: 3,
                            background: e.rate >= 80 ? '#10B981' : e.rate >= 50 ? '#F59E0B' : '#EF4444'
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36,
                          color: e.rate >= 80 ? '#10B981' : e.rate >= 50 ? '#F59E0B' : '#EF4444'
                        }}>{e.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTIVITY TAB */}
      {activeTab === 'productivity' && (
        <div>
          {/* Line chart — tasks completed per day */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Daily productivity — last 7 days</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Tasks completed per employee per day</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
                {users.map((user, idx) => (
                  <Line
                    key={user.id}
                    type="monotone"
                    dataKey={user.name.split(' ')[0]}
                    stroke={EMPLOYEE_COLORS[idx % EMPLOYEE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {employeeStats.map((emp) => (
              <div key={emp.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: emp.color }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{emp.fullName}</p>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                    padding: '3px 10px', borderRadius: 20,
                    background: emp.rate >= 80 ? '#ECFDF5' : emp.rate >= 50 ? '#FFFBEB' : '#FEF2F2',
                    color: emp.rate >= 80 ? '#10B981' : emp.rate >= 50 ? '#F59E0B' : '#EF4444'
                  }}>{emp.rate}% done</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  {[
                    { label: 'Total', value: emp.total },
                    { label: 'Done', value: emp.done },
                    { label: 'Overdue', value: emp.overdue },
                    { label: 'Pending', value: emp.pending },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '12px 0' }}>
                      <p style={{ fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>{value}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div>
          <div style={cardStyle}>
            {/* Month navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                {monthNames[selectedMonth]} {selectedYear}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => {
                  if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
                  else setSelectedMonth(m => m - 1)
                }} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                  fontSize: 14, fontFamily: 'Inter, sans-serif', color: 'var(--text)'
                }}>← Prev</button>
                <button onClick={() => {
                  if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
                  else setSelectedMonth(m => m + 1)
                }} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                  fontSize: 14, fontFamily: 'Inter, sans-serif', color: 'var(--text)'
                }}>Next →</button>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {/* Empty cells for first day */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 80 }} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dayTasks = getTasksForDay(day)
                const isToday = new Date().getDate() === day &&
                  new Date().getMonth() === selectedMonth &&
                  new Date().getFullYear() === selectedYear
                const hasOverdue = dayTasks.some(t => t.status !== 'done')

                return (
  <div key={day} style={{
    minHeight: 90, padding: '8px 6px',
    borderRadius: 8, border: '1px solid',
    borderColor: isToday ? '#4F46E5' : 'var(--border)',
    background: isToday ? '#EEF2FF' : 'var(--bg)',
  }}>
    <p style={{
      fontSize: 13, fontWeight: isToday ? 700 : 500,
      color: isToday ? '#4F46E5' : 'var(--text)',
      marginBottom: 4
    }}>{day}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {dayTasks.map(task => {
        const assigneeIdx = users.findIndex(u => u.id === task.assigned_to)
        const empColor = EMPLOYEE_COLORS[assigneeIdx % EMPLOYEE_COLORS.length]
        const isDone = task.status === 'done'
        const isTaskOverdue = task.status !== 'done' && new Date(task.deadline) < new Date()
        const bgColor = isDone ? '#ECFDF5' : isTaskOverdue ? '#FEF2F2' : `${empColor}18`
        const textColor = isDone ? '#10B981' : isTaskOverdue ? '#EF4444' : empColor

        return (
          <div key={task.id} title={`${task.title} — ${task.assignee?.name}`} style={{
            fontSize: 10, fontWeight: 600,
            padding: '3px 6px', borderRadius: 4,
            background: bgColor,
            color: textColor,
            borderLeft: `2px solid ${textColor}`,
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'default'
          }}>
            {task.title}
          </div>
        )
      })}
    </div>
  </div>
)
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {[
                { color: '#10B981', bg: '#ECFDF5', label: 'Completed' },
                { color: '#4F46E5', bg: '#EEF2FF', label: 'Upcoming' },
                { color: '#EF4444', bg: '#FEF2F2', label: 'Overdue' },
              ].map(({ color, bg, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `1px solid ${color}` }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}