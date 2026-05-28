import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Cpu, BookOpen } from 'lucide-react'
import { apiFetch } from '../api'

export default function Chat({ isReady, onDebugUpdate, toggleDrawer }) {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Welcome to NexusRAG. Ask me anything about your indexed documents.' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [recommendations, setRecommendations] = useState([])
    const chatHistoryRef = useRef(null)
    const textareaRef = useRef(null)
    const idRef = useRef(0)

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        let active = true
        if (isReady && recommendations.length === 0) {
            const load = async () => {
                try {
                    const provider = localStorage.getItem('nexus-provider')
                    const apiKey = localStorage.getItem('nexus-api-key')
                    const headers = {}
                    if (provider) headers['x-llm-provider'] = provider
                    if (apiKey) headers['x-llm-api-key'] = apiKey

                    const res = await apiFetch('/recommend-questions', { headers })
                    if (res.ok && active) {
                        const data = await res.json()
                        setRecommendations(data.questions || [])
                    }
                } catch (err) {
                    console.error("Failed to load recommendations", err)
                }
            }
            load()
        }
        return () => { active = false }
    }, [isReady, recommendations.length])

    const handleSend = async (query = input) => {
        if (!query.trim() || loading) return

        const userMsg = { role: 'user', content: query }
        const currentId = ++idRef.current
        const aiId = `ai-${currentId}`
        const aiMsgPlaceholder = { role: 'ai', content: '__typing__', id: aiId }

        setMessages(prev => [...prev, userMsg, aiMsgPlaceholder])
        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setLoading(true)

        try {
            const provider = localStorage.getItem('nexus-provider')
            const apiKey = localStorage.getItem('nexus-api-key')
            const headers = { 'Content-Type': 'application/json' }
            if (provider) headers['x-llm-provider'] = provider
            if (apiKey) headers['x-llm-api-key'] = apiKey

            const res = await apiFetch('/ask', {
                method: 'POST',
                headers,
                body: JSON.stringify({ query })
            })
            const data = await res.json()

            if (res.ok) {
                setMessages(prev => prev.map(m => m.id === aiId ? {
                    role: 'ai',
                    content: data.answer,
                    sources: data.sources
                } : m))
                if (data.chunks) {
                    onDebugUpdate(data.chunks)
                    toggleDrawer(true, 'ask')
                }
            } else {
                setMessages(prev => prev.map(m => m.id === aiId ? {
                    role: 'ai',
                    content: `Error: ${data.detail}`
                } : m))
            }
        } catch (err) {
            console.error("Query failed", err)
            setMessages(prev => prev.map(m => m.id === aiId ? {
                role: 'ai',
                content: 'Connection error — please try again.'
            } : m))
        } finally {
            setLoading(false)
        }
    }

    const handleTextareaInput = (e) => {
        const el = e.target
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 150) + 'px'
        setInput(el.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!isReady) {
        return (
            <div className="page-container page-fade-in">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <MessageSquare size={28} />
                    </div>
                    <h3>Knowledge Base Empty</h3>
                    <p>Upload or sync some documents first to start chatting with NexusRAG.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container page-fade-in">
            <div className="chat-editorial">
                <div className="chat-scroller" ref={chatHistoryRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-bubble ${m.role === 'ai' ? 'assistant' : 'user'}`}>
                            <div className="chat-label">
                                {m.role === 'ai' ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <Cpu size={9} /> NexusRAG Engine
                                    </span>
                                ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <MessageSquare size={9} /> Your Query
                                    </span>
                                )}
                            </div>
                            <div className="chat-text">
                                {m.content === '__typing__' ? (
                                    <div className="typing-dots">
                                        <span /><span /><span />
                                    </div>
                                ) : (
                                    <>
                                        {m.content}
                                        {m.sources && m.sources.length > 0 && (
                                            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {m.sources.map((s, si) => (
                                                    <a key={si} href={s.link} target="_blank" rel="noopener noreferrer" className="source-ref">
                                                        <BookOpen size={10} />
                                                        {s.name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {recommendations.length > 0 && (
                    <div className="recommendation-pills">
                        {recommendations.map((q, i) => (
                            <button key={i} className="rec-pill" onClick={() => handleSend(q)}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <div className="floating-input-wrap">
                    <textarea
                        ref={textareaRef}
                        className="floating-textarea"
                        placeholder="Ask NexusRAG anything about your documents..."
                        rows="1"
                        value={input}
                        onChange={handleTextareaInput}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="btn btn-accent"
                        style={{ padding: '0.55rem 1rem', borderRadius: 10, flexShrink: 0 }}
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                    >
                        <Send size={15} />
                        Query
                    </button>
                </div>
            </div>
        </div>
    )
}
