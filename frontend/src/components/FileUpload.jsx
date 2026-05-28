import { useState, useRef } from 'react'
import { UploadCloud, Link as LinkIcon, FileText, Zap } from 'lucide-react'
import { apiFetch } from '../api'

export default function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [folderLink, setFolderLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileSelection = (selectedFile) => {
    const validTypes = ['application/pdf', 'text/plain']
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.txt')) {
      setMessage({ type: 'error', text: 'Please select a valid PDF or TXT file.' })
      return
    }

    const MAX_SIZE_MB = 50
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.` })
      return
    }

    setFile(selectedFile)
    setMessage(null)
  }

  const uploadFile = async () => {
    if (!file) return
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiFetch('/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully processed ${file.name} (${data.total_new_chunks} chunks).` })
        setFile(null)
        if (onUploadSuccess) onUploadSuccess()
      } else {
        setMessage({ type: 'error', text: data.detail || 'Upload failed.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const syncPublicFolder = async () => {
    if (!folderLink) return

    const match = folderLink.match(/folders\/([a-zA-Z0-9_-]+)/)
    if (!match) {
      setMessage({ type: 'error', text: 'Invalid Google Drive folder link.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await apiFetch('/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: match[1] })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully synced ${data.files_processed} files.` })
        setFolderLink('')
        if (onUploadSuccess) onUploadSuccess()
      } else {
        setMessage({ type: 'error', text: data.detail || 'Sync failed.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const syncDemoData = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await apiFetch('/sync-demo', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Demo Corpus Synced: ${data.files_processed} files, ${data.total_new_chunks} chunks indexed.` })
        if (onUploadSuccess) onUploadSuccess()
      } else {
        setMessage({ type: 'error', text: data.detail || 'Demo sync failed.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred during demo sync.' })
    } finally {
      setLoading(false)
    }
  }

  const syncAssignmentDrive = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await apiFetch('/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: '1H7w8K20_e848OQx0PX0HgESxlnJywcqV' })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully synced ${data.files_processed} files from Assignment Drive.` })
        if (onUploadSuccess) onUploadSuccess()
      } else {
        setMessage({ type: 'error', text: data.detail || 'Sync failed.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-fade-in page-container">
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Data Ingestion
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Upload individual documents or link a public Drive folder to index content.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '2rem',
          borderRadius: 'var(--radius-sm)',
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'var(--accent-soft)',
          color: message.type === 'error' ? 'var(--danger)' : 'var(--text-title)',
          border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-strong)'}`,
          fontSize: '0.825rem',
          fontWeight: 500
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* ── Direct Upload Card ── */}
        <div className="editorial-card">
          <div className="path-icon" style={{ marginBottom: '1rem' }}>
            <UploadCloud size={20} />
          </div>
          <h3 className="card-title">Direct Upload</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Process and index a local PDF or TXT file immediately.
          </p>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${isDragging ? 'var(--text-title)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'var(--accent-soft)' : 'transparent',
              transition: 'var(--transition)',
              marginBottom: '1.5rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) handleFileSelection(e.target.files[0])
              }}
            />
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FileText size={28} color="var(--text-title)" />
                <span style={{ fontWeight: 600, color: 'var(--text-title)', fontSize: '0.85rem' }}>{file.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                <UploadCloud size={28} style={{ opacity: 0.7 }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Drag & drop file here</p>
                <span style={{ fontSize: '0.75rem' }}>PDF or TXT only (Max 50MB)</span>
              </div>
            )}
          </div>

          <button
            className="btn btn-accent"
            style={{ width: '100%' }}
            disabled={!file || loading}
            onClick={uploadFile}
          >
            {loading && file ? 'Uploading & Indexing...' : 'Process Document'}
          </button>
        </div>

        {/* ── Public Folder Sync Card ── */}
        <div className="editorial-card">
          <div className="path-icon" style={{ marginBottom: '1rem' }}>
            <LinkIcon size={20} />
          </div>
          <h3 className="card-title">Drive Sync</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Index a public Google Drive folder. NexusRAG will extract all text and PDF files found inside.
          </p>

          <input
            type="text"
            className="input-field"
            placeholder="https://drive.google.com/drive/folders/..."
            value={folderLink}
            onChange={(e) => setFolderLink(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />

          <button
            className="btn btn-ghost"
            style={{ width: '100%', border: '1px solid var(--border-strong)' }}
            disabled={!folderLink || loading}
            onClick={syncPublicFolder}
          >
            {loading && !file ? 'Syncing Repository...' : 'Sync Public Folder'}
          </button>
        </div>

        {/* ── Demo Corpus Card ── */}
        <div className="editorial-card">
          <div className="path-icon" style={{ marginBottom: '1rem' }}>
            <Zap size={20} />
          </div>
          <h3 className="card-title">Demo Data</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Directly sync 7 distinct, 100+ line documents covering topics like Quantum Computing, Mars Colonization, and Medieval History.
          </p>

          <button
            className="btn btn-accent"
            style={{ width: '100%', background: 'var(--accent-2)', color: 'var(--bg-page)' }}
            disabled={loading}
            onClick={syncDemoData}
          >
            {loading && !file ? 'Syncing...' : 'Direct Sync Demo Data'}
          </button>
        </div>

        {/* ── Assignment Drive Card ── */}
        <div className="editorial-card">
          <div className="path-icon" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
            <LinkIcon size={20} />
          </div>
          <h3 className="card-title">Assignment Drive</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Sync the specific Google Drive folder provided for the assignment evaluation.
          </p>

          <input
            type="text"
            className="input-field"
            readOnly
            value="https://drive.google.com/drive/folders/1H7w8K20_e848OQx0PX0HgESxlnJywcqV"
            style={{ marginBottom: '1rem', opacity: 0.6, fontSize: '0.75rem' }}
          />

          <button
            className="btn btn-ghost"
            style={{ width: '100%', border: '1px solid var(--border-strong)' }}
            disabled={loading}
            onClick={syncAssignmentDrive}
          >
            {loading && !file ? 'Syncing Drive...' : 'Sync Assignment Drive'}
          </button>
        </div>

      </div>
    </div>
  )
}
