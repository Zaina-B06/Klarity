import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const testimonials = [
  {
    quote: "Klarity completely changed how I manage my sales team. I used to chase people on WhatsApp all day — now I just open the dashboard and everything is there.",
    name: "Rohan Mehta", role: "Founder, RetailEdge", initials: "RM", color: "#4edea3"
  },
  {
    quote: "The WhatsApp integration is genius. My team didn't have to learn anything new. Tasks just showed up on their phone and they replied done. That's it.",
    name: "Priya Shetty", role: "Operations Manager, QuickServe", initials: "PS", color: "#d0bcff"
  },
  {
    quote: "The AI advisor flagged that one of my employees was overloaded before I even noticed. That alone saved us from missing a major client deadline.",
    name: "Amir Khan", role: "CEO, BuildFast", initials: "AK", color: "#7bd0ff"
  }
]

const features = [
  { icon: '▦', title: 'Live Team Tracking', desc: 'See every employee\'s task load, status, and health score in one glance. No chasing, no guessing.', color: '#4edea3', glow: 'rgba(78,222,163,0.08)' },
  { icon: '✦', title: 'AI Behavioral Insights', desc: 'AI analyzes work patterns and flags risks before they become problems. Plain English, no jargon.', color: '#d0bcff', glow: 'rgba(208,188,255,0.08)' },
  { icon: '◎', title: 'WhatsApp Native', desc: 'Employees get tasks and update status directly on WhatsApp. Zero app install, zero friction.', color: '#7bd0ff', glow: 'rgba(123,208,255,0.08)' },
  { icon: '∿', title: 'Performance Analytics', desc: 'Weekly trends, completion rates, on-time scores — everything a manager needs to make decisions.', color: '#4edea3', glow: 'rgba(78,222,163,0.08)' },
]

const steps = [
  { n: '01', title: 'Manager creates a task', desc: 'Assign work to any team member in seconds from the dashboard.', color: '#4edea3' },
  { n: '02', title: 'Employee gets a WhatsApp message', desc: 'Task details land directly on their phone. No app needed.', color: '#d0bcff' },
  { n: '03', title: 'Employee replies "done"', desc: 'One word. Dashboard updates instantly. Manager sees it in real time.', color: '#4edea3' },
  { n: '04', title: 'AI surfaces insights', desc: 'Klarity flags patterns, risks, and standout performers automatically.', color: '#7bd0ff' },
]

const stats = [
  { value: '20–30%', label: 'Productivity loss in untracked SMEs' },
  { value: '5–50', label: 'Employees — the gap nobody solved' },
  { value: '0', label: 'Apps employees need to install' },
]

const completionData = [
  { name: 'Riya', rate: 29 },
  { name: 'Amir', rate: 60 },
  { name: 'Priya', rate: 20 },
  { name: 'Rohan', rate: 80 },
]

const breakdownData = [
  { name: 'Riya', Done: 2, InProgress: 2, Pending: 1, Overdue: 2 },
  { name: 'Amir', Done: 3, InProgress: 1, Pending: 0, Overdue: 1 },
  { name: 'Priya', Done: 1, InProgress: 0, Pending: 3, Overdue: 1 },
  { name: 'Rohan', Done: 4, InProgress: 1, Pending: 1, Overdue: 0 },
]

const statusPie = [
  { name: 'Done', value: 10, color: '#4edea3' },
  { name: 'In Progress', value: 3, color: '#7bd0ff' },
  { name: 'Pending', value: 9, color: '#F59E0B' },
  { name: 'Overdue', value: 8, color: '#ef4444' },
]

const priorityPie = [
  { name: 'High', value: 11, color: '#ef4444' },
  { name: 'Medium', value: 7, color: '#F59E0B' },
  { name: 'Low', value: 4, color: '#4edea3' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: '#dae2fd', fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 12 }}>{p.name}: {p.value}{p.name === 'rate' ? '%' : ''}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [vis, setVis] = useState({})
  const refs = useRef({})

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVis(p => ({ ...p, [e.target.id]: true })) }),
      { threshold: 0.08 }
    )
    Object.entries(refs.current).forEach(([, r]) => r && observer.observe(r))
    return () => observer.disconnect()
  }, [])

  const ref = (id) => (el) => { if (el) { el.id = id; refs.current[id] = el } }
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const isScrolled = scrollY > 60

  const anim = (id, delay = 0) => ({
    opacity: vis[id] ? 1 : 0,
    transform: vis[id] ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0b1326', color: '#dae2fd', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.04)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .glass { background: rgba(45,52,73,0.4); backdrop-filter: blur(24px); }
        .nav-btn { background:none; border:none; cursor:pointer; font-family:Inter,sans-serif; font-size:14px; font-weight:500; padding:8px 14px; border-radius:8px; transition:color .2s; }
        .feature-card { transition: transform .25s, box-shadow .25s; cursor:default; }
        .feature-card:hover { transform:translateY(-6px); box-shadow: 0 20px 48px rgba(78,222,163,0.08) !important; }
        .step-row { transition: background .2s, padding-left .2s; border-radius:12px; }
        .step-row:hover { background: rgba(78,222,163,0.04); padding-left: 12px !important; }
        .primary-btn { transition: transform .2s, box-shadow .2s; display:inline-block; text-decoration:none; }
        .primary-btn:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(78,222,163,0.35) !important; }
        .ghost-btn { transition: background .2s; cursor:pointer; }
        .ghost-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .test-card { transition: transform .25s, box-shadow .25s; }
        .test-card:hover { transform:translateY(-4px); }
        .chart-card { transition: transform .2s, border-color .2s; }
        .chart-card:hover { transform:translateY(-3px); border-color: rgba(78,222,163,0.2) !important; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 80px', height: 64,
        background: isScrolled ? 'rgba(11,19,38,0.95)' : 'rgba(11,19,38,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.4s ease',
        boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
      }}>
        <span style={{ fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-0.5px', color: '#4edea3' }}>Klarity</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['Features','features'],['Analytics','analytics'],['How it works','how-it-works'],['Testimonials','testimonials']].map(([label, id]) => (
            <button key={id} className="nav-btn" onClick={() => scrollTo(id)} style={{ color: 'rgba(218,226,253,0.6)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4edea3'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(218,226,253,0.6)'}
            >{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" className="nav-btn" style={{ color: 'rgba(218,226,253,0.6)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#4edea3'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(218,226,253,0.6)'}
          >Sign in</Link>
          <Link to="/register" className="primary-btn" style={{
            background: '#4edea3', color: '#003824', padding: '9px 22px',
            borderRadius: 9, fontSize: 14, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(78,222,163,0.3)',
          }}>Get started free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '120px 80px 80px',
        background: 'linear-gradient(160deg, #060e20 0%, #0d1535 55%, #060e20 100%)',
      }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(78,222,163,0.15) 0%, transparent 65%)', animation: 'pulse 5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(208,188,255,0.08) 0%, transparent 65%)', animation: 'pulse 7s ease-in-out infinite 2s', pointerEvents: 'none' }} />
        {[
          { top: '22%', left: '7%', s: 6, d: '0s' }, { top: '68%', left: '6%', s: 4, d: '1.2s' },
          { top: '28%', right: '9%', s: 8, d: '0.6s' }, { top: '72%', right: '7%', s: 5, d: '1.8s' },
          { top: '50%', left: '15%', s: 3, d: '2.2s' },
        ].map((d, i) => (
          <div key={i} style={{ position: 'absolute', top: d.top, left: d.left, right: d.right, width: d.s, height: d.s, borderRadius: '50%', background: '#4edea3', opacity: 0.3, animation: `float 3.5s ease-in-out infinite ${d.d}`, pointerEvents: 'none' }} />
        ))}

        <div style={{ maxWidth: 820, textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.9s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)', borderRadius: 99, padding: '6px 18px', marginBottom: 36 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4edea3', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#4edea3', fontWeight: 700, letterSpacing: '0.08em' }}>SYSTEM STATUS: ACTIVE</span>
          </div>

          <h1 style={{ fontSize: 80, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-3px', lineHeight: 1.0, color: '#dae2fd', marginBottom: 28 }}>
            Precision<br />
            <span style={{ color: '#4edea3', fontStyle: 'italic', textShadow: '0 0 20px rgba(78,222,163,0.3)' }}>in Motion.</span>
          </h1>

          <p style={{ fontSize: 19, color: 'rgba(218,226,253,0.55)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 48px' }}>
            Klarity gives small business managers real-time visibility into their team's work — without making employees download another app.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link to="/register" className="primary-btn" style={{
              background: '#4edea3', color: '#003824', fontSize: 16, fontWeight: 700,
              padding: '15px 38px', borderRadius: 10, boxShadow: '0 4px 24px rgba(78,222,163,0.3)',
            }}>Initialize System →</Link>
            <button onClick={() => scrollTo('how-it-works')} className="ghost-btn" style={{
              background: 'rgba(255,255,255,0.06)', color: '#dae2fd', fontSize: 16, fontWeight: 500,
              padding: '15px 38px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Inter, sans-serif',
            }}>See how it works</button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✓ No app install for employees', '✓ WhatsApp native', '✓ AI insights built in'].map(p => (
              <span key={p} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: 'rgba(218,226,253,0.5)', fontWeight: 500 }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#131b2e', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '56px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, textAlign: 'center' }}>
          {stats.map(({ value, label }, i) => (
            <div key={value} style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none', padding: '0 24px' }}>
              <p style={{ fontSize: 52, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#4edea3', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 10, textShadow: '0 0 20px rgba(78,222,163,0.25)' }}>{value}</p>
              <p style={{ fontSize: 14, color: 'rgba(218,226,253,0.5)', lineHeight: 1.6 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section ref={ref('features')} style={{ background: '#0b1326', padding: '100px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 60, ...anim('features') }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#4edea3', letterSpacing: '0.1em', marginBottom: 14 }}>PLATFORM</p>
            <h2 style={{ fontSize: 48, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#dae2fd', maxWidth: 500 }}>The Kinetic Advantage</h2>
            <p style={{ fontSize: 16, color: 'rgba(218,226,253,0.5)', marginTop: 14, maxWidth: 560, lineHeight: 1.7 }}>Harness AI-powered intelligence to transform how your team breathes, thinks, and executes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {features.map(({ icon, title, desc, color, glow }, i) => (
              <div key={title} className="feature-card glass" style={{
                borderRadius: 24, padding: '40px',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative', overflow: 'hidden',
                ...anim('features', i * 0.12 + 0.1)
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: glow, filter: 'blur(40px)', pointerEvents: 'none' }} />
                <div style={{ fontSize: 40, color, marginBottom: 20, animation: 'float 3.5s ease-in-out infinite', display: 'inline-block' }}>{icon}</div>
                <h3 style={{ fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#dae2fd', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(218,226,253,0.5)', lineHeight: 1.8 }}>{desc}</p>
                <div style={{ height: 2, width: 40, background: color, borderRadius: 2, marginTop: 24, transition: 'width 0.6s ease' }}
                  onMouseEnter={e => e.currentTarget.style.width = '100%'}
                  onMouseLeave={e => e.currentTarget.style.width = '40px'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANALYTICS SHOWCASE */}
      <section ref={ref('analytics')} style={{ background: '#131b2e', padding: '100px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, ...anim('analytics') }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#4edea3', letterSpacing: '0.1em', marginBottom: 14 }}>ANALYTICS</p>
            <h2 style={{ fontSize: 48, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#dae2fd', maxWidth: 600 }}>
              The Pulse Dashboard —{' '}
              <span style={{ color: '#4edea3', fontStyle: 'italic' }}>live.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(218,226,253,0.5)', marginTop: 14, maxWidth: 560, lineHeight: 1.7 }}>
              Real-time telemetry across every employee. From atomic tasks to company-wide performance — all in one place.
            </p>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20, ...anim('analytics', 0.1) }}>
            {[
              { label: 'Total Tasks', value: 22, color: '#4edea3', icon: '▦' },
              { label: 'Completed', value: 10, color: '#4edea3', icon: '✓' },
              { label: 'In Progress', value: 3, color: '#7bd0ff', icon: '▶' },
              { label: 'Overdue', value: 8, color: '#ef4444', icon: '!' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="glass" style={{
                borderRadius: 14, padding: '18px 20px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 12,
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: color }} />
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ fontSize: 10, color: 'rgba(218,226,253,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#dae2fd', lineHeight: 1.1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16, ...anim('analytics', 0.2) }}>
            {/* Completion rate bar chart */}
            <div className="chart-card glass" style={{ borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#dae2fd', marginBottom: 4 }}>Completion rate by employee</p>
              <p style={{ fontSize: 12, color: 'rgba(218,226,253,0.4)', marginBottom: 24 }}>% of assigned tasks marked done</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={completionData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(218,226,253,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(218,226,253,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rate" name="Completion %" radius={[6, 6, 0, 0]}>
                    {completionData.map((entry, i) => (
                      <Cell key={i} fill={entry.rate >= 60 ? '#4edea3' : entry.rate >= 40 ? '#F59E0B' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status donut */}
            <div className="chart-card glass" style={{ borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#dae2fd', marginBottom: 4 }}>Task status breakdown</p>
              <p style={{ fontSize: 12, color: 'rgba(218,226,253,0.4)', marginBottom: 16 }}>Overall distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#dae2fd' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'rgba(218,226,253,0.6)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, ...anim('analytics', 0.3) }}>
            {/* Task breakdown grouped bar */}
            <div className="chart-card glass" style={{ borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#dae2fd', marginBottom: 4 }}>Task breakdown by employee</p>
              <p style={{ fontSize: 12, color: 'rgba(218,226,253,0.4)', marginBottom: 24 }}>Done, in progress, pending, overdue</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={breakdownData} barSize={14}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(218,226,253,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(218,226,253,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'rgba(218,226,253,0.6)' }} />
                  <Bar dataKey="Done" fill="#4edea3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="InProgress" name="In Progress" fill="#7bd0ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority pie */}
            <div className="chart-card glass" style={{ borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#dae2fd', marginBottom: 4 }}>Tasks by priority</p>
              <p style={{ fontSize: 12, color: 'rgba(218,226,253,0.4)', marginBottom: 16 }}>High, medium, low split</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priorityPie} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value">
                    {priorityPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#dae2fd' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'rgba(218,226,253,0.6)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Advisor teaser */}
          <div className="glass" style={{
            borderRadius: 20, padding: '28px 32px', marginTop: 16,
            border: '1px solid rgba(78,222,163,0.15)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            ...anim('analytics', 0.4)
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, #4edea3, #7bd0ff)', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✦</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#dae2fd', marginBottom: 4 }}>AI Advisor says:</p>
                <p style={{ fontSize: 13, color: 'rgba(218,226,253,0.55)', lineHeight: 1.6 }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Priya</span> has 4 overdue tasks and may need support.{' '}
                  <span style={{ color: '#4edea3', fontWeight: 600 }}>⭐ Rohan</span> is your top performer this week — consider giving him more responsibility.
                </p>
              </div>
            </div>
            <Link to="/register" className="primary-btn" style={{
              background: '#4edea3', color: '#003824', fontSize: 13, fontWeight: 700,
              padding: '10px 22px', borderRadius: 9, flexShrink: 0, marginLeft: 24,
              boxShadow: '0 4px 14px rgba(78,222,163,0.25)',
            }}>See your team →</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={ref('how-it-works')} style={{ background: '#060e20', padding: '100px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'flex-start' }}>
          <div style={anim('how-it-works')}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#4edea3', letterSpacing: '0.1em', marginBottom: 14 }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 44, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-1.5px', color: '#dae2fd', lineHeight: 1.1, marginBottom: 24 }}>
              Path to <span style={{ color: '#4edea3', fontStyle: 'italic' }}>Resonance</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(218,226,253,0.5)', lineHeight: 1.8, marginBottom: 32 }}>A four-stage lifecycle designed to bring your team from chaos to total clarity.</p>
            <div className="glass" style={{ padding: '24px', borderRadius: 16, border: '1px solid rgba(78,222,163,0.15)', borderLeft: '3px solid #4edea3' }}>
              <p style={{ fontSize: 14, fontStyle: 'italic', color: '#dae2fd', lineHeight: 1.75, marginBottom: 12 }}>"Klarity turned our messy WhatsApp group into a real operations system. Setup took 10 minutes."</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#4edea3' }}>— Founder, QuickServe India</p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 39, top: 40, bottom: 40, width: 1, background: 'linear-gradient(to bottom, #4edea3, #d0bcff, transparent)' }} />
            {steps.map(({ n, title, desc, color }, i) => (
              <div key={n} className="step-row" style={{
                display: 'flex', gap: 28, alignItems: 'flex-start',
                padding: '24px 8px', marginBottom: 8,
                ...anim('how-it-works', i * 0.12 + 0.2)
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                  background: '#131b2e', border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 800, color, fontFamily: 'Plus Jakarta Sans',
                  transition: 'all .3s', zIndex: 1, position: 'relative',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#003824' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#131b2e'; e.currentTarget.style.color = color }}
                >{n}</div>
                <div style={{ paddingTop: 20 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: '#dae2fd', fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 14, color: 'rgba(218,226,253,0.45)', lineHeight: 1.75 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section ref={ref('testimonials')} style={{ background: '#0b1326', padding: '100px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, ...anim('testimonials') }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#4edea3', letterSpacing: '0.1em', marginBottom: 14 }}>TESTIMONIALS</p>
              <h2 style={{ fontSize: 44, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-1.5px', color: '#dae2fd', lineHeight: 1.1 }}>Leader Perspectives</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {testimonials.map(({ quote, name, role, initials, color }, i) => (
              <div key={name} className="test-card glass" style={{
                borderRadius: 20, padding: '40px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                ...anim('testimonials', i * 0.15)
              }}>
                <div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 22 }}>
                    {[...Array(5)].map((_, j) => <span key={j} style={{ color, fontSize: 18 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: 15, color: '#dae2fd', lineHeight: 1.85, marginBottom: 28, fontStyle: 'italic' }}>"{quote}"</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${color}18`, border: `1px solid ${color}40`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', flexShrink: 0 }}>{initials}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#dae2fd' }}>{name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(218,226,253,0.45)', marginTop: 3 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#060e20', padding: '100px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 400, background: 'rgba(78,222,163,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="glass" style={{
            borderRadius: 40, padding: '80px', textAlign: 'center',
            border: '1px solid rgba(78,222,163,0.15)',
            boxShadow: '0 0 60px rgba(78,222,163,0.07)'
          }}>
            <h2 style={{ fontSize: 52, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-1.5px', color: '#dae2fd', marginBottom: 18, lineHeight: 1.1 }}>
              Ready to enter the{' '}
              <span style={{ color: '#4edea3', fontStyle: 'italic' }}>Kinetic Flow?</span>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(218,226,253,0.55)', marginBottom: 44, maxWidth: 460, margin: '0 auto 44px', lineHeight: 1.7 }}>
              Join teams already managing smarter. Set up in minutes, no credit card required.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
              <Link to="/register" className="primary-btn" style={{
                background: '#4edea3', color: '#003824', fontSize: 16, fontWeight: 700,
                padding: '17px 48px', borderRadius: 10, boxShadow: '0 4px 24px rgba(78,222,163,0.25)',
              }}>INITIALIZE NOW</Link>
              <Link to="/login" style={{
                background: 'rgba(255,255,255,0.06)', color: '#dae2fd', fontSize: 16, fontWeight: 600,
                padding: '17px 48px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none', transition: 'background .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >Sign in</Link>
            </div>
            <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['✓ Free to start', '✓ No credit card', '✓ Setup in 5 minutes'].map(text => (
                <span key={text} style={{ fontSize: 13, color: 'rgba(218,226,253,0.4)', fontWeight: 500 }}>{text}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#060e20', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 18, color: '#4edea3', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>Klarity</p>
          <p style={{ fontSize: 12, color: 'rgba(218,226,253,0.28)', marginTop: 4 }}>© 2026 Intelligence in Motion. All rights reserved.</p>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(218,226,253,0.28)' }}>Built for SMEs. Powered by AI.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Sign in', '/login'], ['Register', '/register']].map(([label, to]) => (
            <Link key={to} to={to} style={{ fontSize: 13, color: 'rgba(218,226,253,0.35)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4edea3'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(218,226,253,0.35)'}
            >{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}