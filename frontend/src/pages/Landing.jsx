import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const features = [
  { icon: '▦', title: 'Live team tracking', desc: 'See every employee\'s task load, status, and health score in one glance. No chasing, no guessing.' },
  { icon: '✦', title: 'AI behavioral insights', desc: 'AI analyzes work patterns and flags risks before they become problems. Plain English, no jargon.' },
  { icon: '◎', title: 'WhatsApp native', desc: 'Employees get tasks and update status directly on WhatsApp. Zero app install, zero friction.' },
  { icon: '∿', title: 'Performance analytics', desc: 'Weekly trends, completion rates, on-time scores — everything a manager needs to make decisions.' },
]

const steps = [
  { step: '01', title: 'Manager creates a task', desc: 'Assign work to any team member in seconds.' },
  { step: '02', title: 'Employee gets a WhatsApp message', desc: 'Task details land directly in their phone. No app needed.' },
  { step: '03', title: 'Employee replies "done"', desc: 'One word. Dashboard updates instantly.' },
  { step: '04', title: 'AI surfaces insights', desc: 'Klarity flags patterns, risks, and standout performers.' },
]

const stats = [
  { value: '20-30%', label: 'Productivity loss in untracked SMEs' },
  { value: '5–50', label: 'Employees — the gap nobody solved' },
  { value: '0', label: 'Apps employees need to install' },
]

const floatingWords = ['Track', 'Manage', 'Analyze', 'Grow', 'Clarity']

export default function Landing() {
  const [wordIdx, setWordIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [featVisible, setFeatVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % floatingWords.length)
        setVisible(true)
      }, 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      if (window.scrollY > 200) setFeatVisible(true)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#111827', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .hero-word {
          display: inline-block;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .feature-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(79,70,229,0.15) !important;
        }
        .nav-link:hover {
          color: #4F46E5 !important;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(79,70,229,0.5) !important;
        }
        .step-item {
          transition: all 0.2s ease;
        }
        .step-item:hover {
          background: rgba(79,70,229,0.04);
          border-radius: 12px;
          padding-left: 8px;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 80px', background: scrollY > 50 ? 'rgba(10,10,20,0.95)' : '#0A0A14',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease'
      }}>
        <h1 style={{ fontSize: 22, color: '#6EE7B7', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>Klarity</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" className="nav-link" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 16px', transition: 'color 0.2s' }}>
            Sign in
          </Link>
          <Link to="/register" style={{
            background: '#4F46E5', color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, padding: '9px 22px', borderRadius: 8,
            transition: 'all 0.2s ease'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4338CA' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0A14 0%, #0F0F2E 60%, #0A0A14 100%)',
        padding: '120px 80px 100px', position: 'relative', overflow: 'hidden', minHeight: '90vh',
        display: 'flex', alignItems: 'center'
      }}>
        {/* Animated background blobs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.25) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '0', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(110,231,183,0.1) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite 2s', pointerEvents: 'none'
        }} />

        {/* Floating dots */}
        {[
          { top: '20%', left: '10%', size: 6, delay: '0s' },
          { top: '60%', left: '5%', size: 4, delay: '1s' },
          { top: '30%', right: '15%', size: 8, delay: '0.5s' },
          { top: '70%', right: '10%', size: 5, delay: '1.5s' },
          { top: '45%', left: '20%', size: 3, delay: '2s' },
        ].map((dot, i) => (
          <div key={i} style={{
            position: 'absolute', top: dot.top, left: dot.left, right: dot.right,
            width: dot.size, height: dot.size, borderRadius: '50%',
            background: '#6EE7B7', opacity: 0.4,
            animation: `float 3s ease-in-out infinite ${dot.delay}`
          }} />
        ))}

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeUp 0.8s ease forwards' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 32
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE7B7', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#6EE7B7', fontWeight: 600, letterSpacing: '0.06em' }}>
              AI-POWERED WORKFORCE INTELLIGENCE
            </span>
          </div>

          <h2 style={{
            fontSize: 72, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            letterSpacing: '-2.5px', lineHeight: 1.05, color: '#fff',
            marginBottom: 24, maxWidth: 800
          }}>
            Your team,{' '}
            <span className="hero-word" style={{
              color: '#6EE7B7', opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(10px)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(110,231,183,0.3)',
              textUnderlineOffset: 8
            }}>
              finally visible.
            </span>
          </h2>

          <p style={{
            fontSize: 20, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
            marginBottom: 48, maxWidth: 560,
            animation: 'fadeUp 0.8s ease 0.2s both'
          }}>
            Klarity gives small business managers real-time visibility into their team's work — without making employees download another app.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeUp 0.8s ease 0.4s both' }}>
            <Link to="/register" className="cta-btn" style={{
              background: '#4F46E5', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 600, padding: '15px 36px', borderRadius: 10,
              boxShadow: '0 4px 24px rgba(79,70,229,0.4)', transition: 'all 0.2s ease',
              display: 'inline-block'
            }}>Start for free →</Link>
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.07)', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 500, padding: '15px 36px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s ease',
              display: 'inline-block'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            >Sign in</Link>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 56, flexWrap: 'wrap', animation: 'fadeUp 0.8s ease 0.6s both' }}>
            {['✓ No app install for employees', '✓ WhatsApp native', '✓ AI insights built in'].map(label => (
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
            padding: '0 20px',
            animation: `fadeUp 0.6s ease ${i * 0.1}s both`
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
      <div style={{ background: '#F8F9FC', padding: '100px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64, animation: featVisible ? 'fadeUp 0.6s ease forwards' : 'none', opacity: featVisible ? 1 : 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', letterSpacing: '0.1em', marginBottom: 12 }}>FEATURES</p>
            <h3 style={{
              fontSize: 42, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              letterSpacing: '-1px', maxWidth: 500, lineHeight: 1.2
            }}>Everything a manager needs</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {features.map(({ icon, title, desc }, i) => (
              <div key={title} className="feature-card" style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: 16, padding: '36px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                borderTop: i === 0 ? '3px solid #4F46E5' : i === 1 ? '3px solid #6EE7B7' : '1px solid #E5E7EB',
                animation: featVisible ? `fadeUp 0.6s ease ${i * 0.1 + 0.2}s both` : 'none',
                opacity: featVisible ? 1 : 0
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: i < 2 ? (i === 0 ? '#EEF2FF' : '#ECFDF5') : '#F9FAFB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: i === 0 ? '#4F46E5' : i === 1 ? '#10B981' : '#6B7280',
                  marginBottom: 20, animation: 'float 3s ease-in-out infinite'
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

      {/* How it works */}
      <div style={{ background: '#0A0A14', padding: '100px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.1em', marginBottom: 12 }}>HOW IT WORKS</p>
            <h3 style={{
              fontSize: 42, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              letterSpacing: '-1px', color: '#fff', lineHeight: 1.2
            }}>From task to done —{' '}
              <span style={{ color: '#6EE7B7' }}>automatically.</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map(({ step, title, desc }, i) => (
              <div key={step} className="step-item" style={{
                display: 'flex', gap: 32, alignItems: 'flex-start',
                padding: '28px 8px',
                borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#4F46E5',
                  fontFamily: 'Plus Jakarta Sans',
                  background: 'rgba(79,70,229,0.15)', borderRadius: 6,
                  padding: '4px 10px', textAlign: 'center', flexShrink: 0, marginTop: 2
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
        background: '#4F46E5', padding: '100px 80px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none', animation: 'pulse 4s infinite'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontSize: 52, fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            letterSpacing: '-1.5px', color: '#fff', marginBottom: 16, lineHeight: 1.1
          }}>Ready to get Klarity?</h3>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 40 }}>
            Join teams already managing smarter.
          </p>
          <Link to="/register" style={{
            background: '#fff', color: '#4F46E5', textDecoration: 'none',
            fontSize: 16, fontWeight: 700, padding: '18px 52px', borderRadius: 10,
            display: 'inline-block', transition: 'all 0.2s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
          >Get started free →</Link>
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