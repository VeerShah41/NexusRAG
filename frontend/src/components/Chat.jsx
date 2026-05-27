import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function Chat({ isReady }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isReady && messages.length === 0) {
      fetchRecommendations()
    }
  }, [isReady, messages.length])

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/recommend-questions')
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.questions || [])
      }
    } catch (e) {
      console.error("Failed to fetch recommendations", e)
    }
  }

  const handleSend = async (query) => {
    if (!query.trim()) return
    
    const userMsg = { role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.answer,
          chunks: data.chunks,
          sources: data.sources 
        }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.detail}`, isError: true }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error while connecting to the server.', isError: true }])
    } finally {
      setLoading(false)
    }
  }

  if (!isReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <HelpCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h3>Knowledge Base Empty</h3>
        <p style={{ marginTop: '0.5rem' }}>Upload some documents first to start chatting.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {messages.length === 0 && (
          <div style={{ margin: 'auto', maxWidth: '600px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Bot size={48} color="var(--primary)" />
            </div>
            <h2 style={{ marginBottom: '1rem', color: '#fff' }}>How can I help you today?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Ask anything about the documents in your knowledge base.
            </p>
            
            {recommendations.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Suggested Questions</p>
                {recommendations.map((rec, i) => (
                  <button 
                    key={i}
                    className="btn btn-secondary" 
                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-lg)' }}
                    onClick={() => handleSend(rec)}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '80%', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                background: msg.role === 'user' ? 'var(--bg-glass-hover)' : 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border)',
                padding: '1rem', 
                borderRadius: 'var(--radius-lg)', 
                borderTopRightRadius: msg.role === 'user' ? 0 : 'var(--radius-lg)',
                borderTopLeftRadius: msg.role === 'assistant' ? 0 : 'var(--radius-lg)',
                color: msg.isError ? 'var(--error)' : 'var(--text-main)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>

              {/* Sources and Relevance Ranking */}
              {msg.chunks && msg.chunks.length > 0 && (
                <div style={{ width: '100%' }}>
                  <SourcesPanel chunks={msg.chunks} />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', borderTopLeftRadius: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Loader size={16} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-glass)' }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ask a question about your documents..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!input.trim() || loading}
            style={{ borderRadius: 'var(--radius-lg)', padding: '0 1.5rem' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

function SourcesPanel({ chunks }) {
  const [isOpen, setIsOpen] = useState(false)

  // deduplicate files for quick summary
  const uniqueFiles = [...new Set(chunks.map(c => c.file_name))]

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: '0.5rem', width: '100%' }}>
      <button 
        style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.85rem' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} /> Retrieved Context ({chunks.length} chunks from {uniqueFiles.length} file{uniqueFiles.length > 1 ? 's' : ''})
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '-0.5rem', textTransform: 'uppercase' }}>Relevance Ranking</p>
          {chunks.map((chunk, i) => {
            // Inner product scores usually vary, we'll normalize them to a rough percentage for UI (assuming they are usually around 10-100+)
            // Just a visual representation
            const percentage = Math.min(100, Math.max(10, Math.round((chunk.relevance_score / 150) * 100)))
            
            return (
              <div key={i} style={{ fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                    📄 {chunk.file_name}
                  </span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{chunk.relevance_score.toFixed(2)} Score</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent)', borderRadius: '2px' }}></div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-muted)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{chunk.chunk_text}"
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
