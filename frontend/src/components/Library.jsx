import { useState, useEffect } from 'react'
import { FileText, BookOpen, Activity, Trash2 } from 'lucide-react'
import { apiFetch } from '../api'

export default function Library({ status, onRefresh }) {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await apiFetch('/documents')
                if (res.ok) {
                    const data = await res.json()
                    setDocuments(data)
                }
            } catch (e) {
                console.error("Failed to fetch documents", e)
            } finally {
                setLoading(false)
            }
        }
        fetchDocs()
    }, [status])

    const handleDelete = async (fileName) => {
        if (!window.confirm(`Delete ${fileName} from the index?`)) return

        setDeleting(fileName)
        try {
            const res = await apiFetch(`/documents/${encodeURIComponent(fileName)}`, { method: 'DELETE' })
            if (res.ok) {
                if (onRefresh) onRefresh()
            } else {
                alert("Failed to delete document.")
            }
        } catch (e) {
            console.error("Delete failed", e)
            alert("Network error during deletion.")
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="page-container page-fade-in">
            <div className="editorial-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Card Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: 'var(--accent-soft)', border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <BookOpen size={18} />
                        </div>
                        <h3 className="card-title" style={{ margin: 0 }}>Knowledge Library</h3>
                    </div>
                    <span className="badge-nexus">
                        {documents.length} Indexed
                    </span>
                </div>

                {/* Table */}
                <div style={{ padding: '0 2rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                                <Activity size={24} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                                <span style={{ fontSize: '0.825rem' }}>Loading document fragments...</span>
                            </div>
                            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <FileText size={28} />
                            </div>
                            <h3>No Documents Indexed</h3>
                            <p>Sync your Google Drive or use the demo corpus to populate the NexusRAG knowledge library.</p>
                        </div>
                    ) : (
                        <table className="editorial-table">
                            <thead>
                                <tr>
                                    <th>Identifier</th>
                                    <th>Type</th>
                                    <th>Density</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((d, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <FileText size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                                <span style={{ fontWeight: 600, color: 'var(--text-title)', fontSize: '0.85rem' }}>{d.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-nexus" style={{ fontSize: '0.6rem' }}>{d.type}</span>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-body)', fontSize: '0.8rem' }}>{d.chunks} chunks</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                className="btn btn-ghost btn-sm" 
                                                style={{ color: 'var(--danger)', opacity: deleting === d.name ? 0.5 : 1 }}
                                                disabled={deleting === d.name}
                                                onClick={() => handleDelete(d.name)}
                                                title="Delete Document"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
