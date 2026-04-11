import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, getTasks, getInsights, registerUser, deleteUser } from '../api'

const getHealth = (rate) => {
  if (rate >= 80) return { label: 'On Track', color: '#10B981', bg: '#ECFDF5', border: '#10B981' }
  if (rate >= 50) return { label: 'At Risk', color: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B' }
  return { label: 'Needs Attention', color: '#EF4444', bg: '#FEF2F2', border: '#EF4444' }
}

export default function Dashboard() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState([])
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ name: '', phone_number: '', department: '', password: '' })
  const [addingEmployee, setAddingEmployee] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getUsers(), getTasks()]).then(([u, t]) => {
      setUsers(u.data.filter(u => u.role === 'employee'))
      setTasks(t.data)
      setLoading(false)
    })
    getInsights().then(res => {
      setInsights(res.data)
      setInsightsLoading(false)
    })
  }, [])

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.phone_number || !newEmployee.password) return
    setAddingEmployee(true)
    try {
      await registerUser({ ...newEmployee, role: 'employee' })
      setNewEmployee({ name: '', phone_number: '', department: '', password: '' })
      setShowAddEmployee(false)
      const [u, t] = await Promise.all([getUsers(), getTasks()])
      setUsers(u.data.filter(u => u.role === 'employee'))
      setTasks(t.data)
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to add employee')
    }
    setAddingEmployee(false)
  }

  const handleDeleteEmployee = async (e, userId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to remove this employee? All their tasks will be deleted too.')) return
    await deleteUser(userId)
    const [u, t] = await Promise.all([getUsers(), getTasks()])
    setUsers(u.data.filter(u => u.role === 'employee'))
    setTasks(t.data)
  }

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
  const overallRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const summaryCards = [
    { label: 'Total Tasks', value: totalTasks, bg: 'linear-gradient(135deg, #4F46E5, #7C3AED)', icon: '▦', sub: 'Across all employees' },
    { label: 'Completed', value: doneTasks, bg: 'linear-gradient(135deg, #10B981, #059669)', icon: '✓', sub: `${overallRate}% completion rate` },
    { label: 'Pending', value: pendingTasks, bg: 'linear-gradient(135deg, #F59E0B, #D97706)', icon: '◷', sub: 'Awaiting action' },
    { label: 'Overdue', value: overdueTasks, bg: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: '!', sub: 'Need immediate attention' },
  ]

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: 14, outline: 'none',
    fontFamily: 'Inter, sans-serif'
  }

  return (
    <div>
      <style>{`
        .emp-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .emp-card { transition: all 0.2s ease; }
        .summary-card { transition: all 0.2s ease; }
        .summary-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 28, letterSpacing: '-0.5px', color: 'var(--text)' }}>Team Overview</h2>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          background: overallRate >= 70 ? '#ECFDF5' : overallRate >= 40 ? '#FFFBEB' : '#FEF2F2',
          border: `1px solid ${overallRate >= 70 ? '#10B981' : overallRate >= 40 ? '#F59E0B' : '#EF4444'}`,
          borderRadius: 10, padding: '10px 20px', textAlign: 'center'
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team Health</p>
          <p style={{ fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: overallRate >= 70 ? '#10B981' : overallRate >= 40 ? '#F59E0B' : '#EF4444' }}>{overallRate}%</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {summaryCards.map(({ label, value, bg, icon, sub }) => (
          <div key={label} className="summary-card" style={{
            borderRadius: 14, padding: '20px 24px', position: 'relative', overflow: 'hidden',
            background: 'var(--surface)', border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: bg }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{label}</p>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#fff', fontWeight: 700
              }}>{icon}</div>
            </div>
            <p style={{ fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div style={{ marginBottom: 32 }}>
        <div onClick={() => setInsightsOpen(!insightsOpen)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: insightsOpen ? '12px 12px 0 0' : 12,
          padding: '14px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em'
            }}>✦ AI INSIGHTS</div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {insightsLoading ? 'Generating...' : `${insights.length} employees analyzed by AI`}
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
            {insightsOpen ? '▲ Hide' : '▼ Show'}
          </span>
        </div>

        {insightsOpen && (
          <div style={{
            border: '1px solid var(--border)', borderTop: 'none',
            borderRadius: '0 0 12px 12px', padding: 16,
            background: 'var(--surface2)'
          }}>
            {insightsLoading ? (
              <p style={{ color: 'var(--muted)', fontSize: 14, padding: '8px 0' }}>Analyzing team performance...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {insights.map(({ employee_id, name, insights: obs }) => (
                  <div key={employee_id} onClick={() => navigate(`/employee/${employee_id}`)} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderLeft: '3px solid #4F46E5', borderRadius: 10,
                    padding: '14px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: '#EEF2FF', color: '#4F46E5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700
                      }}>{name.split(' ').map(n => n[0]).join('')}</div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5' }}>{name}</p>
                    </div>
                    {obs.map((text, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        marginBottom: i < obs.length - 1 ? 8 : 0,
                        paddingBottom: i < obs.length - 1 ? 8 : 0,
                        borderBottom: i < obs.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        <span style={{ color: '#4F46E5', fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{text}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Employees header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Employees ({users.length})</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Click any card to view details</p>
          <button onClick={() => setShowAddEmployee(!showAddEmployee)} style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            padding: '8px 16px', borderRadius: 8, fontWeight: 600,
            fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>+ Add Employee</button>
        </div>
      </div>

      {/* Add Employee form */}
      {showAddEmployee && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24, marginBottom: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add New Employee</h3>
            <button onClick={() => setShowAddEmployee(false)} style={{
              background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer'
            }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'FULL NAME *', key: 'name', placeholder: 'e.g. Priya Sharma', type: 'text' },
              { label: 'PHONE NUMBER *', key: 'phone_number', placeholder: '+91XXXXXXXXXX', type: 'text' },
              { label: 'DEPARTMENT', key: 'department', placeholder: 'e.g. Sales, Design, Engineering', type: 'text' },
              { label: 'PASSWORD *', key: 'password', placeholder: 'Set a login password', type: 'password' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>{label}</label>
                <input type={type} style={inputStyle} placeholder={placeholder}
                  value={newEmployee[key]}
                  onChange={e => setNewEmployee({ ...newEmployee, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleAddEmployee} disabled={addingEmployee} style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8, fontWeight: 600,
              fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>{addingEmployee ? 'Adding...' : 'Add Employee'}</button>
            <button onClick={() => setShowAddEmployee(false)} style={{
              background: 'none', color: 'var(--muted)', border: '1px solid var(--border)',
              padding: '10px 20px', borderRadius: 8, fontWeight: 500,
              fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Employee cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {users.map(user => {
          const stats = getStats(user.id)
          const health = getHealth(stats.rate)
          return (
            <div key={user.id} className="emp-card" onClick={() => navigate(`/employee/${user.id}`)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: 24, cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: health.border }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${health.border}30, ${health.border}60)`,
                    border: `2px solid ${health.border}40`,
                    color: health.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15, fontFamily: 'Plus Jakarta Sans'
                  }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{user.department || 'Employee'}</p>
                  </div>
                </div>

                {/* Health badge + delete button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 12px',
                    borderRadius: 20, background: health.bg, color: health.color,
                    border: `1px solid ${health.color}30`
                  }}>{health.label}</span>
                  <button
                    onClick={(e) => handleDeleteEmployee(e, user.id)}
                    title="Remove employee"
                    style={{
                      background: 'none', border: '1px solid transparent',
                      color: 'var(--muted)', width: 24, height: 24,
                      borderRadius: 6, cursor: 'pointer', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', flexShrink: 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FECACA' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'transparent' }}
                  >×</button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Completion rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: health.color }}>{stats.rate}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${stats.rate}%`,
                    background: `linear-gradient(90deg, ${health.border}, ${health.border}99)`,
                    borderRadius: 4, transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Total', value: stats.total, color: 'var(--text)' },
                  { label: 'Done', value: stats.done, color: '#10B981' },
                  { label: 'Active', value: stats.inProgress, color: '#4F46E5' },
                  { label: 'Overdue', value: stats.overdue, color: '#EF4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color }}>{value}</p>
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