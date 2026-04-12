import { useEffect, useState, useRef } from 'react'
import { getUsers, getTasks, getInsights } from '../api'

export default function Report() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const reportRef = useRef()

  useEffect(() => {
    Promise.all([getUsers(), getTasks(), getInsights()]).then(([u, t, i]) => {
      setUsers(u.data.filter(u => u.role === 'employee'))
      setTasks(t.data)
      setInsights(i.data)
      setLoading(false)
    })
  }, [])

  const getStats = (employeeId) => {
    const assigned = tasks.filter(t => t.assigned_to === employeeId)
    const done = assigned.filter(t => t.status === 'done')
    const inProgress = assigned.filter(t => t.status === 'in_progress')
    const overdue = assigned.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date())
    const pending = assigned.filter(t => t.status === 'pending')
    const rate = assigned.length > 0 ? Math.round((done.length / assigned.length) * 100) : 0
    return { total: assigned.length, done: done.length, inProgress: inProgress.length, overdue: overdue.length, pending: pending.length, rate }
  }

  const getHealth = (rate) => {
    if (rate >= 80) return { label: 'On Track', color: '#10B981' }
    if (rate >= 50) return { label: 'At Risk', color: '#F59E0B' }
    return { label: 'Needs Attention', color: '#EF4444' }
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length
  const overallRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const handlePrint = () => window.print()

  if (loading) return <p style={{ color: 'var(--muted)' }}>Generating report...</p>

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { background: white !important; color: black !important; padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Top bar — no print */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, letterSpacing: '-0.5px' }}>Team Report</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Generated on {today}</p>
        </div>
        <button onClick={handlePrint} style={{
          background: '#4edea3', color: '#003824', border: 'none',
          padding: '11px 28px', borderRadius: 9, fontWeight: 700,
          fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          boxShadow: '0 4px 14px rgba(78,222,163,0.3)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          ↓ Save as PDF
        </button>
      </div>

      {/* Report content */}
      <div ref={reportRef} className="print-page" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Report header */}
        <div style={{ background: 'linear-gradient(135deg, #0b1326, #131b2e)', padding: '36px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, color: '#4edea3', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>KLARITY — INTELLIGENCE IN MOTION</p>
              <h1 style={{ fontSize: 32, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>Workforce Performance Report</h1>
              <p style={{ fontSize: 14, color: 'rgba(218,226,253,0.55)' }}>{today}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(218,226,253,0.4)', marginBottom: 4 }}>OVERALL TEAM HEALTH</p>
              <p style={{ fontSize: 48, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: overallRate >= 70 ? '#4edea3' : overallRate >= 40 ? '#F59E0B' : '#ef4444', lineHeight: 1 }}>{overallRate}%</p>
              <p style={{ fontSize: 12, color: overallRate >= 70 ? '#4edea3' : overallRate >= 40 ? '#F59E0B' : '#ef4444', marginTop: 4 }}>{overallRate >= 70 ? 'On Track' : overallRate >= 40 ? 'At Risk' : 'Needs Attention'}</p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ padding: '28px 40px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { label: 'Total Tasks', value: totalTasks, color: '#4edea3' },
            { label: 'Completed', value: doneTasks, color: '#4edea3' },
            { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#F59E0B' },
            { label: 'Overdue', value: overdueTasks, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color, lineHeight: 1, marginBottom: 6 }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Employee breakdown */}
        <div style={{ padding: '28px 40px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4edea3', letterSpacing: '0.1em', marginBottom: 20 }}>EMPLOYEE PERFORMANCE BREAKDOWN</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 100px 120px', gap: 16, padding: '10px 16px', background: 'var(--surface2)', borderRadius: '8px 8px 0 0' }}>
              {['Employee', 'Total', 'Done', 'Active', 'Overdue', 'Rate', 'Status'].map(h => (
                <p key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</p>
              ))}
            </div>

            {users.map((emp, i) => {
              const stats = getStats(emp.id)
              const health = getHealth(stats.rate)
              const initials = emp.name.split(' ').map(n => n[0]).join('')
              const empInsights = insights.find(ins => ins.employee_id === emp.id)

              return (
                <div key={emp.id}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 100px 120px',
                    gap: 16, padding: '16px', alignItems: 'center',
                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${health.color}20`, color: health.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{emp.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--muted)' }}>{emp.department || 'Employee'}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{stats.total}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#4edea3' }}>{stats.done}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#7bd0ff' }}>{stats.inProgress}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: stats.overdue > 0 ? '#ef4444' : 'var(--muted)' }}>{stats.overdue}</p>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: health.color, marginBottom: 4 }}>{stats.rate}%</p>
                      <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', width: 80 }}>
                        <div style={{ height: '100%', width: `${stats.rate}%`, background: health.color, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: `${health.color}18`, color: health.color, width: 'fit-content' }}>{health.label}</span>
                  </div>

                  {/* AI Insights for this employee */}
                  {empInsights && empInsights.insights.length > 0 && (
                    <div style={{ padding: '12px 16px 16px 58px', background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#4edea3', letterSpacing: '0.06em', marginBottom: 8 }}>✦ AI INSIGHTS</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {empInsights.insights.map((insight, j) => (
                          <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <span style={{ color: '#4edea3', fontSize: 10, marginTop: 3, flexShrink: 0 }}>→</span>
                            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Generated by Klarity — Intelligence in Motion</p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{today}</p>
        </div>
      </div>
    </div>
  )
}