import { useState, useEffect } from 'react'
import { FileUp, Database, MessageSquare, Menu, X, Link, UploadCloud } from 'lucide-react'
import './index.css'
import FileUpload from './components/FileUpload'
import Chat from './components/Chat'
import Library from './components/Library'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [systemStatus, setSystemStatus] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch status on load and when refreshTrigger changes
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/status')
        if (res.ok) {
          const data = await res.json()
          setSystemStatus(data)
          // Auto switch to chat if there are indexed docs and we just started
          if (data.faiss_index_exists && activeTab === 'upload' && refreshTrigger === 0) {
            setActiveTab('chat')
          }
        }
      } catch (err) {
        console.error("Failed to fetch status", err)
      }
    }
    fetchStatus()
  }, [refreshTrigger])

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1)

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--primary), #14b8a6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={20} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>NexusRAG</h1>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="btn btn-secondary" style={{ display: 'none' }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Status Badge */}
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: systemStatus?.faiss_index_exists ? 'var(--success)' : 'var(--warning)' }}></div>
          {systemStatus?.faiss_index_exists ? `${systemStatus.unique_documents} Docs Indexed` : 'Waiting for documents'}
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
        
        {/* Sidebar Nav */}
        <nav className="glass-panel" style={{ width: '240px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'upload' ? 'btn-primary' : ''}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'upload' ? 'var(--primary)' : 'transparent', color: activeTab === 'upload' ? 'white' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('upload')}
          >
            <FileUp size={18} /> Add Documents
          </button>
          
          <button 
            className={`btn ${activeTab === 'library' ? 'btn-primary' : ''}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'library' ? 'var(--primary)' : 'transparent', color: activeTab === 'library' ? 'white' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('library')}
          >
            <Database size={18} /> Document Library
          </button>

          <button 
            className={`btn ${activeTab === 'chat' ? 'btn-primary' : ''}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'chat' ? 'var(--primary)' : 'transparent', color: activeTab === 'chat' ? 'white' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={18} /> Ask Nexus AI
          </button>
        </nav>

        {/* Content Area */}
        <main className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 'upload' && <FileUpload onUploadSuccess={triggerRefresh} />}
          {activeTab === 'library' && <Library status={systemStatus} onClearSuccess={triggerRefresh} />}
          {activeTab === 'chat' && <Chat isReady={systemStatus?.faiss_index_exists} />}
        </main>

      </div>
    </div>
  )
}

export default App
