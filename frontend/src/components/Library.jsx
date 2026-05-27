import { useState } from 'react'
import { Database, Trash2, FileText, Activity } from 'lucide-react'

export default function Library({ status, onClearSuccess }) {
  const [loading, setLoading] = useState(false)

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to delete all indexed documents? This cannot be undone.")) return
    
    setLoading(true)
    try {
      const res = await fetch('/clear-data', { method: 'POST' })
      if (res.ok) {
        onClearSuccess()
      } else {
        alert("Failed to clear data.")
      }
    } catch (e) {
      alert("Network error.")
    } finally {
      setLoading(false)
    }
  }

  if (!status) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading status...</div>
  }

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#fff', marginBottom: '0.25rem' }}>Document Library</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your indexed knowledge base.</p>
        </div>
        
        <button 
          className="btn btn-outline" 
          style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
          onClick={handleClear}
          disabled={loading || !status.faiss_index_exists}
        >
          <Trash2 size={16} /> {loading ? 'Clearing...' : 'Clear All Data'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <FileText size={18} /> Unique Documents
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
            {status.unique_documents || 0}
          </div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <Database size={18} /> Total Text Chunks
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {status.total_chunks_indexed || 0}
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <Activity size={18} /> Index Status
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: status.faiss_index_exists ? 'var(--success)' : 'var(--warning)', marginTop: '0.5rem' }}>
            {status.faiss_index_exists ? 'Active & Ready' : 'Empty'}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.1rem' }}>Indexed Files</h3>
      
      {status.documents && status.documents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {status.documents.map((doc, i) => (
            <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FileText size={20} color="var(--primary)" />
              <span style={{ color: '#fff', fontWeight: 500 }}>{doc.file_name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <Database size={32} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)' }}>No documents have been indexed yet.</p>
        </div>
      )}
    </div>
  )
}
