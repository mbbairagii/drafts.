import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import stampImg from '../assets/11.png'
import Footer from '../components/ui/Footer'

const BG = '#000'
const FONT = "'IM Fell English', serif"
const SANS = "'Palatino Linotype', serif"

const LEFT_WORDS = ['your name.', 'your fear.', 'your voice.', 'your grief.', 'your truth.', 'your shame.', 'your hope.']
const RIGHT_WORDS = ['hidden.', 'kept.', 'buried.', 'secret.', 'safe.', 'yours.', 'forever.']

const SPARKS: { top: string; left: string; size: number; delay: number; dur: number }[] = [
    { top: '5%', left: '3%', size: 3, delay: 0, dur: 3.2 },
    { top: '10%', left: '15%', size: 2, delay: 0.6, dur: 4 },
    { top: '18%', left: '8%', size: 4, delay: 1.4, dur: 3.6 },
    { top: '25%', left: '28%', size: 2, delay: 0.3, dur: 5 },
    { top: '33%', left: '4%', size: 3, delay: 2.1, dur: 3.8 },
    { top: '42%', left: '19%', size: 2, delay: 0.6, dur: 4.4 },
    { top: '51%', left: '10%', size: 3, delay: 1.8, dur: 3.2 },
    { top: '60%', left: '24%', size: 2, delay: 0.9, dur: 4.2 },
    { top: '70%', left: '6%', size: 4, delay: 1.2, dur: 3.5 },
    { top: '78%', left: '17%', size: 2, delay: 2.4, dur: 4.8 },
    { top: '88%', left: '30%', size: 3, delay: 0.9, dur: 3.9 },
    { top: '7%', left: '72%', size: 2, delay: 1.6, dur: 4.1 },
    { top: '15%', left: '84%', size: 4, delay: 0.2, dur: 3.3 },
    { top: '23%', left: '92%', size: 2, delay: 2.8, dur: 5.2 },
    { top: '31%', left: '78%', size: 3, delay: 3.1, dur: 4.6 },
    { top: '40%', left: '88%', size: 2, delay: 1.0, dur: 3.7 },
    { top: '49%', left: '96%', size: 3, delay: 1.7, dur: 4.3 },
    { top: '57%', left: '74%', size: 2, delay: 0.5, dur: 3.9 },
    { top: '66%', left: '90%', size: 4, delay: 2.2, dur: 5.1 },
    { top: '75%', left: '80%', size: 2, delay: 0.7, dur: 4.0 },
    { top: '84%', left: '68%', size: 3, delay: 1.3, dur: 3.6 },
    { top: '92%', left: '85%', size: 2, delay: 2.0, dur: 4.5 },
    { top: '12%', left: '45%', size: 2, delay: 0.4, dur: 4.8 },
    { top: '38%', left: '52%', size: 3, delay: 1.9, dur: 3.4 },
    { top: '63%', left: '48%', size: 2, delay: 2.6, dur: 5.0 },
    { top: '87%', left: '55%', size: 3, delay: 0.8, dur: 3.8 },
    { top: '20%', left: '60%', size: 2, delay: 3.2, dur: 4.2 },
    { top: '74%', left: '40%', size: 3, delay: 1.1, dur: 3.7 },
    { top: '95%', left: '20%', size: 2, delay: 0.2, dur: 4.6 },
    { top: '3%', left: '55%', size: 4, delay: 1.5, dur: 3.3 },
]

export default function RegisterScreen() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [focused, setFocused] = useState<string | null>(null)
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80)
        return () => clearTimeout(t)
    }, [])

    const handleSubmit = async () => {
        if (!email || !username || !password || !confirm) { setError('Fill in all fields.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }
        setError('')
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
        <div style={{ height: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingBottom: '14vh' }}>

            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.06, pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(138,148,168,.16) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 8% 70%, rgba(184,196,216,.12) 0%, transparent 55%), radial-gradient(ellipse 45% 38% at 90% 18%, rgba(138,148,168,.10) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 1 }} />

            {SPARKS.map((s, i) => (
                <div key={i} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 2, top: s.top, left: s.left, width: s.size * 5, height: s.size * 5, animationName: 'sparkle', animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
                    <div style={{ position: 'absolute', width: '100%', height: 1, top: '50%', left: 0, transform: 'translateY(-50%)', background: 'rgba(220,228,240,.95)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', height: '100%', width: 1, left: '50%', top: 0, transform: 'translateX(-50%)', background: 'rgba(220,228,240,.95)', borderRadius: 2 }} />
                </div>
            ))}

            {[
                { top: '8%', left: '5%', dur: 7, delay: 0 },
                { top: '22%', left: '20%', dur: 9, delay: 1.2 },
                { top: '46%', left: '3%', dur: 8, delay: 2.5 },
                { top: '68%', left: '14%', dur: 10, delay: 0.8 },
                { top: '14%', left: '78%', dur: 7.5, delay: 1.8 },
                { top: '36%', left: '92%', dur: 9, delay: 0.3 },
                { top: '60%', left: '73%', dur: 8.5, delay: 2.1 },
                { top: '82%', left: '86%', dur: 11, delay: 1.5 },
                { top: '55%', left: '36%', dur: 8, delay: 3.0 },
                { top: '30%', left: '62%', dur: 9.5, delay: 0.6 },
            ].map((p, i) => (
                <div key={i} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 2, top: p.top, left: p.left, fontSize: 16, color: 'rgba(184,196,216,.45)', animationName: 'plusFloat', animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', fontWeight: 300, lineHeight: 1 }}>+</div>
            ))}

            <div style={{ position: 'fixed', top: 28, right: 44, width: 180, height: 180, zIndex: 20, pointerEvents: 'none', opacity: mounted ? 1 : 0, animationName: mounted ? 'stampDrop' : 'none', animationDuration: '.9s', animationDelay: '.2s', animationTimingFunction: 'cubic-bezier(.16,1,.3,1)', animationFillMode: 'both', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,.8)) drop-shadow(0 3px 8px rgba(138,148,168,.3))' }}>
                <img src={stampImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>

            {/* Left words */}
            <div style={{ position: 'absolute', left: '4%', top: 0, bottom: 0, width: '22vw', zIndex: 2, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0, marginTop: '-12vh' }}>
                {LEFT_WORDS.map((w, i) => (
                    <p key={i} style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 'clamp(15px,1.8vw,24px)', color: `rgba(184,196,216,${0.15 + i * 0.04})`, margin: '0 0 8px', letterSpacing: 1, transform: `translateX(${i * 10}px)`, whiteSpace: 'nowrap', opacity: mounted ? 1 : 0, transition: `opacity 1.2s ${0.5 + i * 0.13}s ease`, animationName: mounted ? 'driftL' : 'none', animationDuration: `${12 + i * 1.8}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: `${i * 0.4}s` }}>{w}</p>
                ))}
            </div>

            {/* Right words */}
            <div style={{ position: 'absolute', right: '4%', top: 0, bottom: 0, width: '22vw', zIndex: 2, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: 0, marginTop: '-12vh' }}>
                {RIGHT_WORDS.map((w, i) => (
                    <p key={i} style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 'clamp(15px,1.8vw,24px)', color: `rgba(184,196,216,${0.15 + i * 0.04})`, margin: '0 0 8px', letterSpacing: 1, transform: `translateX(-${i * 10}px)`, whiteSpace: 'nowrap', opacity: mounted ? 1 : 0, transition: `opacity 1.2s ${0.5 + i * 0.13}s ease`, animationName: mounted ? 'driftR' : 'none', animationDuration: `${12 + i * 1.8}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: `${i * 0.4}s` }}>{w}</p>
                ))}
            </div>

            <div style={{ position: 'absolute', bottom: -40, left: 0, right: 0, zIndex: 1, overflow: 'hidden', opacity: mounted ? 1 : 0, transition: 'opacity 2.5s 0.3s ease', pointerEvents: 'none', userSelect: 'none' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '37vw', fontWeight: 400, color: 'transparent', WebkitTextStroke: '1px rgba(184,196,216,0.08)', backgroundClip: 'text', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(180deg, rgba(184,196,216,0.25) 0%, rgba(138,148,168,0.12) 50%, rgba(138,148,168,0.03) 100%)', margin: 0, padding: 0, lineHeight: 0.82, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>drafts.</p>
            </div>

            <div style={{ position: 'relative', zIndex: 10, width: 520, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)', transition: 'all 1.1s 0.2s cubic-bezier(0.16,1,0.3,1)', marginTop: '-10vh' }}>

                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 12, opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.7s ease' }}>
                        <div style={{ width: 32, height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,196,216,0.65))' }} />
                        <p style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(184,196,216,0.7)', letterSpacing: '0.55em', textTransform: 'uppercase', margin: 0 }}>your archive</p>
                        <div style={{ width: 32, height: 1, background: 'linear-gradient(270deg, transparent, rgba(184,196,216,0.65))' }} />
                    </div>
                    <h1 style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 72, color: 'rgba(240,236,248,1)', letterSpacing: -1, margin: 0, lineHeight: 1, textShadow: '0 0 80px rgba(184,196,216,0.4)', opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.5s ease' }}>drafts.</h1>
                    <p style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 12, color: 'rgba(184,196,216,0.65)', marginTop: 10, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.8s ease' }}>never meant to be sent.</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(184,196,216,0.2)', borderRadius: 4, padding: '44px 48px 40px', backdropFilter: 'blur(28px)', boxShadow: '0 40px 140px rgba(0,0,0,0.8), inset 0 1px 0 rgba(184,196,216,0.15), 0 0 100px rgba(138,148,168,0.06)', position: 'relative', overflow: 'hidden' }}>

                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,196,216,0.55), transparent)' }} />

                    <p style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(184,196,216,0.65)', letterSpacing: '0.6em', textTransform: 'uppercase', margin: '0 0 28px' }}>create your archive</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <RegField label="Username" type="text" value={username} onChange={setUsername} placeholder="what do we call you" focused={focused === 'username'} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} />
                        <RegField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@somewhere.com" focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
                        <RegField label="Password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="make it unguessable" focused={focused === 'password'} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                            showToggle show={showPass} onToggle={() => setShowPass(v => !v)} />
                        <RegField label="Confirm Password" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={setConfirm} placeholder="repeat your password" focused={focused === 'confirm'} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} onEnter={handleSubmit}
                            showToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                    </div>

                    {error && (
                        <p style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 12, color: 'rgba(220,80,80,1)', marginTop: 16, letterSpacing: '0.15em', animationName: 'shakeErr', animationDuration: '0.4s', animationTimingFunction: 'ease' }}>{error}</p>
                    )}

                    <button onClick={handleSubmit} disabled={loading}
                        style={{ width: '100%', marginTop: 30, padding: '18px', border: '1px solid rgba(139,111,62,0.5)', borderRadius: 3, background: loading ? 'rgba(139,111,62,0.1)' : 'linear-gradient(135deg, rgba(139,111,62,0.35), rgba(120,90,35,0.4))', color: loading ? 'rgba(196,168,130,0.5)' : 'rgba(220,196,150,1)', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: SANS, fontStyle: 'italic', letterSpacing: '0.3em', textTransform: 'uppercase', transition: 'all 0.35s ease', boxShadow: loading ? 'none' : '0 0 40px rgba(139,111,62,0.15), inset 0 1px 0 rgba(139,111,62,0.2)' }}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,111,62,0.45), rgba(120,90,35,0.5))'; e.currentTarget.style.borderColor = 'rgba(139,111,62,0.75)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(139,111,62,0.25), inset 0 1px 0 rgba(139,111,62,0.25)'; e.currentTarget.style.letterSpacing = '0.38em' } }}
                        onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,111,62,0.35), rgba(120,90,35,0.4))'; e.currentTarget.style.borderColor = 'rgba(139,111,62,0.5)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(139,111,62,0.15), inset 0 1px 0 rgba(139,111,62,0.2)'; e.currentTarget.style.letterSpacing = '0.3em' } }}>
                        {loading ? 'creating your archive...' : 'begin writing'}
                    </button>

                    <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(184,196,216,0.15)' }} />
                        <p style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 11, color: 'rgba(184,196,216,0.55)', margin: 0, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
                            already have drafts?{' '}
                            <Link to="/login" style={{ color: 'rgba(184,196,216,0.85)', textDecoration: 'none', transition: 'color 0.25s ease' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,228,240,1)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(184,196,216,0.85)')}>sign in</Link>
                        </p>
                        <div style={{ flex: 1, height: 1, background: 'rgba(184,196,216,0.15)' }} />
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');
                @keyframes shakeErr { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
                @keyframes fieldGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
                @keyframes driftL { 0%,100%{transform:translateX(var(--tx,0px)) translateY(0px)} 50%{transform:translateX(var(--tx,0px)) translateY(-6px)} }
                @keyframes driftR { 0%,100%{transform:translateX(var(--tx,0px)) translateY(0px)} 50%{transform:translateX(var(--tx,0px)) translateY(-6px)} }
                @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)} 30%,70%{opacity:1;transform:scale(1) rotate(180deg)} }
                @keyframes plusFloat { 0%,100%{transform:translateY(0px) rotate(0deg);opacity:.35} 50%{transform:translateY(-9px) rotate(15deg);opacity:.6} }
                @keyframes stampDrop { 0%{opacity:0;transform:translateY(-60px) scale(1.1);filter:blur(4px)} 65%{opacity:1;transform:translateY(6px) scale(1.01);filter:blur(0)} 82%{transform:translateY(-3px) scale(.99)} 100%{opacity:1;transform:translateY(0) scale(1)} }
                * { box-sizing: border-box; }
                input::placeholder { color: rgba(184,196,216,0.45); font-style: italic; }
                input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px ${BG} inset !important; -webkit-text-fill-color: rgba(240,236,248,0.95) !important; }
            `}</style>
        </div>
    )
}

function RegField({ label, type, value, onChange, placeholder, focused, onFocus, onBlur, onEnter, showToggle, show, onToggle }: {
    label: string; type: string; value: string
    onChange: (v: string) => void; placeholder: string
    focused: boolean; onFocus: () => void; onBlur: () => void; onEnter?: () => void
    showToggle?: boolean; show?: boolean; onToggle?: () => void
}) {
    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: focused ? 'rgba(220,228,240,0.95)' : 'rgba(184,196,216,0.6)', letterSpacing: '0.55em', textTransform: 'uppercase', transition: 'color 0.3s ease' }}>
                <div style={{ width: focused ? 16 : 6, height: 1, background: focused ? 'rgba(220,228,240,0.85)' : 'rgba(184,196,216,0.45)', transition: 'all 0.3s ease' }} />
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onEnter?.()}
                    onFocus={onFocus} onBlur={onBlur}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: showToggle ? '15px 48px 15px 20px' : '15px 20px', background: focused ? 'rgba(184,196,216,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${focused ? 'rgba(184,196,216,0.55)' : 'rgba(184,196,216,0.25)'}`, borderRadius: 3, color: 'rgba(240,236,248,0.98)', fontSize: 14, outline: 'none', fontFamily: "'Palatino Linotype', Palatino, serif", transition: 'all 0.3s ease', boxShadow: focused ? '0 0 28px rgba(184,196,216,0.15), inset 0 1px 0 rgba(184,196,216,0.1)' : 'none', letterSpacing: type === 'password' ? 4 : 0.3 }}
                />
                {showToggle && (
                    <button onClick={onToggle} tabIndex={-1}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(184,196,216,0.45)', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                        {show ? '🙈' : '👁'}
                    </button>
                )}
                {focused && (
                    <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,196,216,0.7), transparent)', animationName: 'fieldGlow', animationDuration: '2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
                )}
            </div>
        </div>
    )
}
