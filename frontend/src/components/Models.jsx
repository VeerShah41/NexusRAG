import { useState, useEffect } from 'react'
import { Cpu, Key, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function Models() {
    const [provider, setProvider] = useState(() => localStorage.getItem('nexus-provider') || 'groq')
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('nexus-api-key') || '')
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        localStorage.setItem('nexus-provider', provider)
        localStorage.setItem('nexus-api-key', apiKey)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const clearSettings = () => {
        localStorage.removeItem('nexus-provider')
        localStorage.removeItem('nexus-api-key')
        setProvider('groq')
        setApiKey('')
    }

    return (
        <div className="page-container page-fade-in">
            <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                        AI Model Configuration
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        Optionally provide your own API key to bypass rate limits or switch between intelligence providers. If left blank, the system will use the default server-side keys.
                    </p>
                </div>

                <div className="editorial-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                        <div style={{ width: 38, height: 38, background: 'var(--accent-soft)', border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <Cpu size={18} />
                        </div>
                        <h3 className="card-title" style={{ margin: 0 }}>Select Provider</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            className={`btn ${provider === 'groq' ? 'btn-accent' : 'btn-ghost'}`}
                            style={{ 
                                padding: '1rem', 
                                border: provider === 'groq' ? 'none' : '1px solid var(--border-strong)'
                            }}
                            onClick={() => setProvider('groq')}
                        >
                            Groq (LLaMA 3 70B)
                        </button>
                        <button
                            className={`btn ${provider === 'gemini' ? 'btn-accent' : 'btn-ghost'}`}
                            style={{ 
                                padding: '1rem', 
                                border: provider === 'gemini' ? 'none' : '1px solid var(--border-strong)'
                            }}
                            onClick={() => setProvider('gemini')}
                        >
                            Google Gemini (1.5 Flash)
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                        <div style={{ width: 38, height: 38, background: 'var(--accent-soft)', border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <Key size={18} />
                        </div>
                        <h3 className="card-title" style={{ margin: 0 }}>API Key (Optional)</h3>
                    </div>

                    <input
                        type="password"
                        className="input-field"
                        placeholder={`Enter your ${provider === 'groq' ? 'Groq' : 'Gemini'} API Key...`}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ marginBottom: '1.5rem' }}
                    />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-accent" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>
                            {saved ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Configuration'}
                        </button>
                        <button className="btn btn-ghost" onClick={clearSettings} style={{ border: '1px solid var(--border-strong)' }}>
                            Reset to Default
                        </button>
                    </div>
                </div>

                {!apiKey && (
                    <div style={{ 
                        padding: '1rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'rgba(234, 179, 8, 0.1)', 
                        color: '#ca8a04', 
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                        fontSize: '0.825rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span>You are currently using the default server API key. Usage may be subject to rate limits.</span>
                    </div>
                )}
            </div>
        </div>
    )
}
