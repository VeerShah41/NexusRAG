import { useState } from 'react'
import { Sliders, AlertTriangle, Trash2 } from 'lucide-react'
import { apiFetch } from '../api'

export default function Settings({ status, onRefresh }) {
    const [depth, setDepth] = useState(parseInt(localStorage.getItem('hw_retriever_depth') || '5'))
    const [clearing, setClearing] = useState(false)

    const handleDepthChange = (e) => {
        const val = parseInt(e.target.value)
        setDepth(val)
        localStorage.setItem('hw_retriever_depth', val)
    }

    const handleClear = async () => {
        if (!window.confirm("DANGER: Factory reset the NexusRAG neural index? This cannot be reversed.")) return

        setClearing(true)
        try {
            const res = await apiFetch('/clear-data', { method: 'POST' })
            if (res.ok) {
                alert("NexusRAG neural index wiped successfully.")
                onRefresh()
            }
        } catch (err) {
            console.error("Clear failed", err)
            alert("Clear failed.")
        } finally {
            setClearing(false)
        }
    }

    return (
        <div className="page-container page-fade-in">
            <div style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Retriever Depth Card */}
                <div className="editorial-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                        <div style={{ width: 38, height: 38, background: 'var(--accent-soft)', border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <Sliders size={18} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                            <h3 className="card-title" style={{ margin: 0 }}>Retriever Depth</h3>
                            <span className="badge-nexus">TOP {depth}</span>
                        </div>
                    </div>
                    <p className="card-desc">
                        Controls how many document fragments NexusRAG retrieves per query. Higher values yield broader context.
                    </p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            value={depth}
                            onChange={handleDepthChange}
                            className="range-slider"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <span>Focused (1)</span>
                            <span>Comprehensive (12)</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div className="editorial-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                        <div style={{ width: 38, height: 38, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <AlertTriangle size={18} />
                        </div>
                        <h3 className="card-title" style={{ margin: 0, color: '#ef4444' }}>Danger Zone</h3>
                    </div>
                    <p className="card-desc">
                        Permanently wipe all indexed fragments from the NexusRAG knowledge base. This action cannot be undone.
                    </p>
                    <button
                        className="btn btn-danger"
                        style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                        onClick={handleClear}
                        disabled={clearing || !status?.faiss_index_exists}
                    >
                        <Trash2 size={14} />
                        {clearing ? 'Clearing...' : 'Factory Reset NexusRAG Index'}
                    </button>
                    {!status?.faiss_index_exists && (
                        <p className="helper-text" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                            No active index to reset.
                        </p>
                    )}
                </div>

            </div>
        </div>
    )
}
