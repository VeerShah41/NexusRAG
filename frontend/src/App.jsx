import { useState, useEffect, useRef } from 'react'
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  Settings,
  X,
  Zap,
  Sun,
  Moon,
  UploadCloud,
  Cpu
} from 'lucide-react'
import './index.css'

// ── Components ──
import Dashboard from './components/Dashboard'
import FileUpload from './components/FileUpload'
import Library from './components/Library'
import Chat from './components/Chat'
import SettingsPage from './components/Settings'
import Models from './components/Models'
import { apiFetch } from './api'

// ── Particle System ──
function useParticles(theme) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    const COUNT = 50
    const particles = Array.from({ length: COUNT }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      vx:      (Math.random() - 0.5) * 0.3,
      vy:      (Math.random() - 0.5) * 0.3,
      r:       Math.random() * 1.4 + 0.4,
      opacity: Math.random() * 0.35 + 0.06,
      pulse:   Math.random() * Math.PI * 2,
    }))

    const darkColors  = ['190, 190, 190', '110, 110, 110', ' 60,  60,  60']
    const lightColors = ['120, 100,  75', '170, 150, 120', '210, 195, 170']

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const colors = theme === 'light' ? lightColors : darkColors
      const lineAlphaFactor = theme === 'light' ? 0.055 : 0.08

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x
          const dy   = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 125) {
            const alpha = (1 - dist / 125) * lineAlphaFactor
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${colors[0]}, ${alpha})`
            ctx.lineWidth   = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach((p, idx) => {
        p.pulse += 0.013
        const pulsed = p.opacity + Math.sin(p.pulse) * 0.055
        const color  = colors[idx % colors.length]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${pulsed})`
        ctx.fill()

        p.x += p.vx; p.y += p.vy
        if (p.x < -5)    p.x = W + 5
        if (p.x > W + 5) p.x = -5
        if (p.y < -5)    p.y = H + 5
        if (p.y > H + 5) p.y = -5
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [theme])

  return canvasRef
}

// ── App ──
function App() {
  const [activePage,   setActivePage]   = useState('dashboard')
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [systemStatus, setSystemStatus] = useState(null)
  const [lastDebug,    setLastDebug]    = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // ── Theme State ──
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('nexus-theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('nexus-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const canvasRef = useParticles(theme)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiFetch('/status')
        if (res.ok) {
          const data = await res.json()
          setSystemStatus(data)
        }
      } catch (err) {
        console.error('Status fetch failed', err)
      }
    }
    fetchStatus()
  }, [refreshTrigger])

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1)

  const toggleDrawer = (open) => {
    setDrawerOpen(open)
  }

  const navigateTo = (page) => {
    setActivePage(page)
    if (page === 'ask') {
      toggleDrawer(true)
    } else {
      setDrawerOpen(false)
    }
  }

  const getPageMeta = () => {
    const meta = {
      dashboard: { title: 'Workspace Overview', sub: 'Transform document fragments into grounded AI intelligence.' },
      upload:    { title: 'Data Ingestion',     sub: 'Upload documents or sync folders to build the AI corpus.' },
      documents: { title: 'Knowledge Library',  sub: 'Browse and manage your indexed document corpus.' },
      ask:       { title: 'Ask NexusRAG',       sub: 'Query your documents using grounded retrieval intelligence.' },
      models:    { title: 'AI Models',          sub: 'Configure your LLM provider and optional API keys.' },
      settings:  { title: 'System Settings',    sub: 'Configure pipeline depth and maintain the knowledge index.' },
    }
    return meta[activePage] || { title: 'Workspace', sub: '' }
  }

  const pageMeta   = getPageMeta()
  const isIndexed  = systemStatus?.total_chunks_indexed > 0
  const isDark     = theme === 'dark'

  return (
    <div className="app-container">
      <canvas ref={canvasRef} id="nexus-particles" />

      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* ══════════════════════════
          SIDEBAR
      ══════════════════════════ */}
      <aside className="sidebar">
        <div className="brand" onClick={() => navigateTo('dashboard')}>
          <div className="brand-logo">N</div>
          <div className="brand-text">
            <span className="brand-name">NEXUSRAG</span>
            <span className="brand-tag">AI · RAG · v2</span>
          </div>
        </div>

        <div className="sidebar-sep" />

        <div className="nav-section">
          <span className="nav-section-label">Workspace</span>
          <nav className="nav-group">
            {[
              { page: 'dashboard',  icon: <LayoutGrid  size={15} />, label: 'Dashboard'   },
              { page: 'upload',     icon: <UploadCloud size={15} />, label: 'Upload Data' },
              { page: 'documents',  icon: <FileText    size={15} />, label: 'Library'     },
              { page: 'models',     icon: <Cpu         size={15} />, label: 'Models'      },
              { page: 'ask',        icon: <MessageSquare size={15} />, label: 'Ask AI', disabled: !isIndexed },
            ].map(({ page, icon, label, disabled }) => (
              <button
                key={page}
                className={`nav-link ${activePage === page ? 'active' : ''}`}
                style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                title={disabled ? "Please upload and index documents first." : ""}
                onClick={() => {
                  if (!disabled) navigateTo(page)
                }}
              >
                <span className="nav-icon">{icon}</span>
                {label}
                {disabled && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--danger)' }}>LOCKED</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="nav-section" style={{ marginTop: 'auto' }}>
          <span className="nav-section-label">System</span>
          <nav className="nav-group">
            <button
              className={`nav-link ${activePage === 'settings' ? 'active' : ''}`}
              onClick={() => navigateTo('settings')}
            >
              <span className="nav-icon"><Settings size={15} /></span>
              Settings
            </button>

            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isDark
                  ? <Moon size={15} style={{ color: 'var(--accent)' }} />
                  : <Sun  size={15} style={{ color: 'var(--accent-2)' }} />
                }
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className={`toggle-track ${isDark ? '' : 'on'}`}>
                <div className="toggle-thumb" />
              </div>
            </button>
          </nav>
        </div>

        <div className="sidebar-status">
          <div className="status-pill">
            <div className="status-dot" />
            <span>
              {isIndexed
                ? `${systemStatus.total_chunks_indexed} chunks indexed`
                : 'No index active'}
            </span>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════
          MAIN VIEW
      ══════════════════════════ */}
      <main className="main-view">
        <header className="workspace-header">
          <div className="header-content">
            <h1>{pageMeta.title}</h1>
            <p className="page-subtitle">{pageMeta.sub}</p>
          </div>
          <div className="header-actions">
            {isIndexed && (
              <span className="badge-amber">
                <Zap size={9} />
                INDEX ACTIVE
              </span>
            )}
          </div>
        </header>

        <div className="content-inner">
          {activePage === 'dashboard' && <Dashboard  status={systemStatus} isIndexed={isIndexed} onNavigate={navigateTo} />}
          {activePage === 'upload'    && <FileUpload onUploadSuccess={triggerRefresh} />}
          {activePage === 'documents' && <Library    status={systemStatus} onRefresh={triggerRefresh} />}
          {activePage === 'models'    && <Models     />}
          {activePage === 'ask'       && <Chat       isReady={isIndexed} onDebugUpdate={setLastDebug} toggleDrawer={toggleDrawer} />}
          {activePage === 'settings'  && <SettingsPage status={systemStatus} onRefresh={triggerRefresh} />}
        </div>
      </main>

      {/* ══════════════════════════
          CONTEXT DRAWER
      ══════════════════════════ */}
      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-label">RETRIEVAL AUDIT</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.25rem', border: 'none' }}
          >
            <X size={15} />
          </button>
        </div>
        <div className="drawer-body">
          {lastDebug.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.65 }}>
              No retrieval data yet. Ask a question to see context chunks.
            </p>
          ) : (
            lastDebug.map((c, i) => (
              <div key={i} className="retrieval-hit">
                <div className="hit-meta">
                  <span className="hit-index">HIT #{i + 1}</span>
                  <span className="hit-score">
                    SCORE: {c.relevance_score.toFixed(4)}
                  </span>
                </div>
                <div className="hit-text">{c.chunk_text}</div>
                <div className="hit-file">{c.file_name}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
