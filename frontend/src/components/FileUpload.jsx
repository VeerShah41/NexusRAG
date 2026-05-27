import { useState, useRef } from 'react'
import { UploadCloud, Link as LinkIcon, FileText } from 'lucide-react'

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
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully processed ${file.name} (${data.total_new_chunks} chunks).` })
        setFile(null)
        onUploadSuccess()
      } else {
        setMessage({ type: 'error', text: data.detail || 'Upload failed.' })
      }
    } catch (err) {
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
      const res = await fetch('/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: match[1] })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully synced ${data.files_processed} files.` })
        setFolderLink('')
        onUploadSuccess()
      } else {
        setMessage({ type: 'error', text: data.detail || 'Sync failed.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Add Documents to NexusRAG</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Upload files directly or sync a public Google Drive folder to build your AI knowledge base.</p>

      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? 'var(--error)' : 'var(--success)', border: `1px solid ${message.type === 'error' ? 'var(--error)' : 'var(--success)'}` }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Direct Upload Section */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="var(--primary)" /> Direct Upload
          </h3>
          
          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`, 
              borderRadius: 'var(--radius-md)', 
              padding: '3rem 1rem', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: isDragging ? 'var(--primary-glow)' : 'transparent',
              transition: 'all 0.2s'
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
                <FileText size={32} color="var(--primary)" />
                <span style={{ fontWeight: 500, color: '#fff' }}>{file.name}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <UploadCloud size={32} />
                <p>Drag and drop a PDF or TXT file here</p>
                <span style={{ fontSize: '0.85rem' }}>or click to browse</span>
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }} 
            disabled={!file || loading}
            onClick={uploadFile}
          >
            {loading && file ? 'Uploading...' : 'Process Document'}
          </button>
        </div>

        {/* Public Folder Sync Section */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LinkIcon size={20} color="var(--accent)" /> Sync Public Drive Folder
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Paste a link to any public Google Drive folder. NexusRAG will securely download and index all PDFs and text files inside it.
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
            className="btn" 
            style={{ width: '100%', background: 'var(--accent)', color: 'white' }} 
            disabled={!folderLink || loading}
            onClick={syncPublicFolder}
          >
            {loading && !file ? 'Syncing...' : 'Sync Folder'}
          </button>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Want to test? Use our demo folder:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <code style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                https://drive.google.com/drive/folders/1ZP8lXDro7XL3Kfyg2avmDwlSOcAgabc-
              </code>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setFolderLink('https://drive.google.com/drive/folders/1ZP8lXDro7XL3Kfyg2avmDwlSOcAgabc-')}
              >
                Use
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
