import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterScreen() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!email || !username || !password) { setError('Fill in all fields.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setLoading(true)
        try {
            await register(email, username, password)
            navigate('/')
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Something went wrong.')
            setLoading(false)
        }
    }

    return (
        <div style={{ height: '100vh', background: '#0C0C0C', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 70% 30%, rgba(108,99,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(26,107,255,0.04) 0%, transparent 60%)' }} />

            <div className="anim-float-in" style={{ width: 440, position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h1 style={{ fontFamily: "'IM Fell English', Georgia, serif", fontSize: 52, color: '#F5F2ED', letterSpacing: -1, margin: 0 }}>drafts.</h1>
                    <p style={{ color: '#3A3A3A', fontSize: 13, marginTop: 10, letterSpacing: 2, fontFamily: 'Georgia, serif' }}>the folder nobody sees.</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '40px 36px' }}>
                    <p style={{ color: '#6B6B6B', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 28, fontFamily: 'Georgia, serif' }}>Create your archive</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Field label="Username" type="text" value={username} onChange={setUsername} placeholder="what do we call you" />
                        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@somewhere.com" />
                        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="make it unguessable" onEnter={handleSubmit} />
                    </div>

                    {error && <p style={{ color: '#FF2244', fontSize: 13, marginTop: 16, fontFamily: 'Georgia, serif' }}>{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ width: '100%', marginTop: 28, padding: '15px', borderRadius: 12, border: 'none', background: loading ? '#1a1a1a' : 'linear-gradient(135deg, #6c63ff, #1A6BFF)', color: '#fff', fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'IM Fell English', Georgia, serif", letterSpacing: 1, transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 24px rgba(108,99,255,0.35)' }}
                        onMouseEnter={e => { if (!loading) (e.currentTarget).style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)' }}
                    >
                        {loading ? 'Creating...' : 'Begin Writing'}
                    </button>

                    <p style={{ color: '#3A3A3A', fontSize: 13, marginTop: 20, textAlign: 'center', fontFamily: 'Georgia, serif' }}>
                        Already have drafts?{' '}
                        <Link to="/login" style={{ color: '#6c63ff', textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

function Field({ label, type, value, onChange, placeholder, onEnter }: {
    label: string; type: string; value: string
    onChange: (v: string) => void; placeholder: string; onEnter?: () => void
}) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: 7, color: '#6B6B6B', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>{label}</label>
            <input
                type={type} value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onEnter?.()}
                placeholder={placeholder}
                style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#F5F2ED', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
        </div>
    )
}