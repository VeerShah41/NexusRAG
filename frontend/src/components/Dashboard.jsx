import { Database, FileText, Zap, Activity, FolderGit2 } from 'lucide-react'

export default function Dashboard({ status, isIndexed, onNavigate }) {
  const isReady = isIndexed
  const chunks = status?.total_chunks_indexed || 0
  const docCount = status?.documents?.length || 0

  return (
    <div className="page-fade-in page-container">
      {/* ── Hero Status ── */}
      <div className="hero-status" style={{ marginBottom: '3rem' }}>
        <div style={{ zIndex: 1, position: 'relative' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            System Pulse
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', maxWidth: '400px', lineHeight: 1.6 }}>
            Real-time telemetry of the NexusRAG vector engine. Monitor document indexing and retrieval readiness.
          </p>
        </div>

        <div className="hero-stats" style={{ zIndex: 1, position: 'relative' }}>
          <div className="stat-block">
            <span className="stat-label">Vector Chunks</span>
            <span className="stat-value">{chunks}</span>
          </div>
          <div className="stat-block">
            <span className="stat-label">Indexed Docs</span>
            <span className="stat-value">{docCount}</span>
          </div>
          <div className="stat-block">
            <span className="stat-label">Engine Status</span>
            <span className="stat-value" style={{ color: isReady ? 'var(--accent-2)' : 'var(--text-dim)' }}>
              {isReady ? 'ONLINE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Quick Action: Ingestion */}
        <div className="editorial-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('upload')}>
          <div className="path-icon" style={{ marginBottom: '1.25rem' }}>
            <FolderGit2 size={22} />
          </div>
          <h3 className="card-title">Data Ingestion</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Upload local documents, sync public Google Drive folders, or load the pre-built demo corpus.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontSize: '0.8rem', fontWeight: 600 }}>
            Upload Documents →
          </div>
        </div>

        {/* Quick Action: Library */}
        <div className="editorial-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('documents')}>
          <div className="path-icon" style={{ marginBottom: '1.25rem' }}>
            <Database size={22} />
          </div>
          <h3 className="card-title">Knowledge Library</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Browse the indexed document corpus, view chunk distributions, and manage the FAISS vector store.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontSize: '0.8rem', fontWeight: 600 }}>
            View Library →
          </div>
        </div>

        {/* Quick Action: Chat */}
        <div className="editorial-card" style={{ cursor: 'pointer', opacity: isReady ? 1 : 0.6 }} onClick={() => isReady && onNavigate('ask')}>
          <div className="path-icon" style={{ marginBottom: '1.25rem' }}>
            <Zap size={22} />
          </div>
          <h3 className="card-title">RAG Interface</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Query your documents using grounded retrieval. The system cites exact chunks for full transparency.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontSize: '0.8rem', fontWeight: 600 }}>
            {isReady ? 'Ask Questions →' : 'Requires Indexed Data'}
          </div>
        </div>

      </div>
    </div>
  )
}
