import { Link } from 'react-router-dom'

const features = [
  { icon: '▦', title: 'Live team tracking', desc: 'See every employee\'s task load, status, and health score in one glance. No chasing, no guessing.' },
  { icon: '✦', title: 'AI behavioral insights', desc: 'Claude AI analyzes work patterns and flags risks before they become problems. Plain English, no jargon.' },
  { icon: '◎', title: 'WhatsApp native', desc: 'Employees get tasks and update status directly on WhatsApp. Zero app install, zero friction.' },
  { icon: '∿', title: 'Performance analytics', desc: 'Weekly trends, completion rates, on-time scores — everything a manager needs to make decisions.' },
]

const steps = [
  { step: '01', title: 'Manager creates a task', desc: 'Assign work to any team member in seconds — title, deadline, priority.' },
  { step: '02', title: 'Employee gets a WhatsApp message', desc: 'Task details land directly in their phone. No app needed.' },
  { step: '03', title: 'Employee replies "done"', desc: 'One word. Dashboard updates instantly. Manager sees it live.' },
  { step: '04', title: 'AI surfaces insights', desc: 'Klarity flags patterns, risks, and standout performers automatically.' },
]

const stats = [
  { value: '20-30%', label: 'Productivity loss in untracked SMEs' },
  { value: '5–50', label: 'Employees — the gap nobody solved' },
  { value: '0', label: 'Apps employees need to install' },
]

export default function Landing() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#111827', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 80px', background: '#0A0A14',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h1 style={{ fontSize: 22, color: '#6EE7B7', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>Klarity</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 16px' }}>
            Sign in
          </Link>
          <Link to="/register" style={{
            background: '#4F46E5', color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, padding: '9px 22px', borderRadius: 8
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero — dark */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0A14 0%, #0F0F2E 60%, #0A0A14 100%)',
        padding: '110px 80px 90px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 32
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE7B7' }} />
            <span style={{ fontSize: 12, color: '#6EE7B7', fontWeight: 600, letterSpacing: '0.06em' }}>
              AI-POWERED WORKFORCE INTELLIGENCE
            </span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 64, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            letterSpacing: '-2px', lineHeight: 1.05, color: '#fff',
            marginBottom: 24, maxWidth: 750
          }}>
            Your team,{' '}
            <span style={{
              color: '#6EE7B7',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(110,231,183,0.3)',
              textUnderlineOffset: 6
            }}>finally visible.</span>
          </h2>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
            marginBottom: 48, maxWidth: 520
          }}>
            Klarity gives small business managers real-time visibility into their team's work — without making employees download another app.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#4F46E5', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 600, padding: '15px 36px', borderRadius: 10,
              boxShadow: '0 4px 24px rgba(79,70,229,0.4)'
            }}>Start for free →</Link>
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.07)', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 500, padding: '15px 36px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)'
            }}>Sign in</Link>
          </div>

          {/* Floating stat pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 56, flexWrap: 'wrap' }}>
            {[
              { label: '✓ No app install for employees' },
              { label: '✓ WhatsApp native' },
              { label: '✓ AI insights built in' },
            ].map(({ label }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '7px 16px',
                fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500
              }}>{label}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#4F46E5', padding: '48px 80px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 40, textAlign: 'center'
      }}>
        {stats.map(({ value, label }, i) => (
          <div key={value} style={{
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
            padding: '0 20px'
          }}>
            <p style={{
              fontSize: 44, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              color: '#fff', letterSpacing: '-1px', marginBottom: 8
            }}>{value}</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ background: '#F8F9FC', padding: '90px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', letterSpacing: '0.1em', marginBottom: 12 }}>FEATURES</p>
            <h3 style={{
              fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              letterSpacing: '-1px', maxWidth: 500, lineHeight: 1.2
            }}>Everything a manager needs</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {features.map(({ icon, title, desc }, i) => (
              <div key={title} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: 16, padding: '36px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                borderTop: i === 0 ? '3px solid #4F46E5' : i === 1 ? '3px solid #6EE7B7' : '1px solid #E5E7EB'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: i < 2 ? (i === 0 ? '#EEF2FF' : '#ECFDF5') : '#F9FAFB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: i === 0 ? '#4F46E5' : i === 1 ? '#10B981' : '#6B7280',
                  marginBottom: 20
                }}>{icon}</div>
                <h4 style={{
                  fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
                  marginBottom: 10, color: '#111827'
                }}>{title}</h4>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works — dark */}
      <div style={{ background: '#0A0A14', padding: '90px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.1em', marginBottom: 12 }}>HOW IT WORKS</p>
            <h3 style={{
              fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              letterSpacing: '-1px', color: '#fff', lineHeight: 1.2
            }}>From task to done —{' '}
              <span style={{ color: '#6EE7B7' }}>automatically.</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map(({ step, title, desc }, i) => (
              <div key={step} style={{
                display: 'flex', gap: 32, alignItems: 'flex-start',
                padding: '32px 0',
                borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: '#4F46E5',
                  fontFamily: 'Plus Jakarta Sans', minWidth: 32, paddingTop: 4,
                  background: 'rgba(79,70,229,0.15)', borderRadius: 6,
                  padding: '4px 8px', textAlign: 'center'
                }}>{step}</span>
                <div>
                  <h4 style={{
                    fontSize: 18, fontWeight: 700, marginBottom: 6,
                    fontFamily: 'Plus Jakarta Sans', color: '#fff'
                  }}>{title}</h4>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: '#4F46E5', padding: '90px 80px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontSize: 48, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            letterSpacing: '-1.5px', color: '#fff', marginBottom: 16, lineHeight: 1.1
          }}>Ready to get Klarity?</h3>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 40 }}>
            Join teams already managing smarter.
          </p>
          <Link to="/register" style={{
            background: '#fff', color: '#4F46E5', textDecoration: 'none',
            fontSize: 16, fontWeight: 700, padding: '16px 48px', borderRadius: 10,
            display: 'inline-block'
          }}>Get started free →</Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#0A0A14', borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '28px 80px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <p style={{ fontSize: 16, color: '#6EE7B7', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>Klarity</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Built for SMEs. Powered by AI. © 2026</p>
      </div>

    </div>
  )
}