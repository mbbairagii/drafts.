import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [inkLines, setInkLines] = useState<{ id: number; x: number; y: number; angle: number; len: number }[]>([])
    const inkRef = useRef(0)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef = useRef<number>(0)
    const { login } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)
        type Pt = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: number }
        const pts: Pt[] = []
        let frame = 0
        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            frame++
            if (frame % 7 === 0 && pts.length < 90) {
                const fromLeft = Math.random() > 0.5
                pts.push({
                    x: fromLeft ? -8 : canvas.width + 8,
                    y: canvas.height * 0.2 + Math.random() * canvas.height * 0.65,
                    vx: fromLeft ? 0.18 + Math.random() * 0.28 : -(0.18 + Math.random() * 0.28),
                    vy: -(0.04 + Math.random() * 0.18),
                    life: 0, max: 280 + Math.random() * 420,
                    r: 0.5 + Math.random() * 2,
                    hue: 35 + Math.random() * 25,
                })
            }
            for (let i = pts.length - 1; i >= 0; i--) {
                const p = pts[i]
                p.life++
                p.x += p.vx + Math.sin(p.life * 0.022 + i) * 0.18
                p.y += p.vy
                if (p.life >= p.max) { pts.splice(i, 1); continue }
                const pr = p.life / p.max
                const a = pr < 0.12 ? pr / 0.12 : pr > 0.78 ? 1 - (pr - 0.78) / 0.22 : 1
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${p.hue},55%,62%,${a * 0.45})`
                ctx.fill()
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current) }
    }, [])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (Math.random() > 0.82) {
                inkRef.current++
                const id = inkRef.current
                setInkLines(prev => [...prev.slice(-20), { id, x: e.clientX, y: e.clientY, angle: Math.random() * 360, len: 18 + Math.random() * 44 }])
                setTimeout(() => setInkLines(prev => prev.filter(l => l.id !== id)), 1000)
            }
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    const handleSubmit = async () => {
        if (!email || !password) { setError('Fill in both fields.'); return }
        setLoading(true)
        try {
            await login(email, password)
            navigate('/')
        } catch {
            setError('Wrong email or password.')
            setLoading(false)
        }
    }

    const leftWords = ['your fears.', 'your rage.', 'your love.', 'your grief.', 'your truth.', 'your shame.', 'your hope.']
    const rightWords = ['written.', 'locked.', 'kept.', 'secret.', 'safe.', 'yours.', 'forever.']

    return (
        <div style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'none', paddingBottom: '14vh' }}>

            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            {inkLines.map(l => (
                <div key={l.id} style={{ position: 'fixed', left: l.x, top: l.y, width: l.len, height: 1, background: 'linear-gradient(90deg, rgba(200,160,90,0.85), transparent)', transform: `rotate(${l.angle}deg)`, transformOrigin: '0 50%', pointerEvents: 'none', zIndex: 99998, animation: 'inkFade 1s ease forwards' }} />
            ))}

            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.06, pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(130,80,15,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 70% at 80% 30%, rgba(45,30,120,0.16) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,160,90,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,90,0.04) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none', zIndex: 1, opacity: mounted ? 0.6 : 0, transition: 'opacity 3s ease' }} />

            <div style={{ position: 'absolute', bottom: -40, left: 0, right: 0, zIndex: 1, overflow: 'hidden', opacity: mounted ? 1 : 0, transition: 'opacity 2.5s 0.3s ease', pointerEvents: 'none', userSelect: 'none' }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: '37vw', fontWeight: 400, color: 'transparent', WebkitTextStroke: '1px rgba(200,160,90,0.06)', backgroundClip: 'text', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(180deg, rgba(200,160,90,0.22) 0%, rgba(200,160,90,0.08) 50%, rgba(200,160,90,0.03) 100%)', margin: 0, padding: 0, lineHeight: 0.82, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>drafts.</p>
            </div>

            <div style={{ position: 'absolute', left: '4%', top: 0, bottom: 0, width: '22vw', zIndex: 2, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0, marginTop: '-12vh' }}>
                {leftWords.map((w, i) => (
                    <p key={i} style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(15px, 1.8vw, 24px)', color: `rgba(200,160,90,${0.15 + i * 0.04})`, margin: '0 0 8px', letterSpacing: 1, transform: `translateX(${i * 10}px)`, whiteSpace: 'nowrap', opacity: mounted ? 1 : 0, transition: `opacity 1.2s ${0.5 + i * 0.13}s ease`, animation: mounted ? `driftL ${12 + i * 1.8}s ease-in-out infinite` : 'none', animationDelay: `${i * 0.4}s` }}>{w}</p>
                ))}
            </div>

            <div style={{ position: 'absolute', right: '4%', top: 0, bottom: 0, width: '22vw', zIndex: 2, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: 0, marginTop: '-12vh' }}>
                {rightWords.map((w, i) => (
                    <p key={i} style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(15px, 1.8vw, 24px)', color: `rgba(200,160,90,${0.15 + i * 0.04})`, margin: '0 0 8px', letterSpacing: 1, transform: `translateX(-${i * 10}px)`, whiteSpace: 'nowrap', opacity: mounted ? 1 : 0, transition: `opacity 1.2s ${0.5 + i * 0.13}s ease`, animation: mounted ? `driftR ${12 + i * 1.8}s ease-in-out infinite` : 'none', animationDelay: `${i * 0.4}s` }}>{w}</p>
                ))}
            </div>

            <div style={{ position: 'absolute', left: '2%', top: '12%', zIndex: 2, pointerEvents: 'none', opacity: mounted ? 1 : 0, transition: 'opacity 2s 1s ease' }}>
                {['✦', '·', '✧', '—', '·', '✦'].map((g, i) => (
                    <div key={i} style={{ fontFamily: 'serif', fontSize: `${10 + i * 3}px`, color: `rgba(200,160,90,${0.12 + i * 0.035})`, position: 'absolute', left: `${i * 22}px`, top: `${i * 38}px`, animation: `floatGlyph ${5 + i * 1.2}s ease-in-out infinite`, animationDelay: `${i * 0.6}s` }}>{g}</div>
                ))}
            </div>
            <div style={{ position: 'absolute', right: '2%', top: '15%', zIndex: 2, pointerEvents: 'none', opacity: mounted ? 1 : 0, transition: 'opacity 2s 1.2s ease' }}>
                {['·', '✦', '—', '✧', '·', '✦'].map((g, i) => (
                    <div key={i} style={{ fontFamily: 'serif', fontSize: `${10 + i * 3}px`, color: `rgba(200,160,90,${0.12 + i * 0.035})`, position: 'absolute', right: `${i * 22}px`, top: `${i * 38}px`, animation: `floatGlyph ${5 + i * 1.2}s ease-in-out infinite`, animationDelay: `${i * 0.8}s` }}>{g}</div>
                ))}
            </div>

            <div style={{ position: 'absolute', right: '3%', bottom: '32%', zIndex: 2, pointerEvents: 'none', opacity: mounted ? 1 : 0, transition: 'opacity 2s 1.9s ease', textAlign: 'right' }}>
                <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 11, color: 'rgba(200,160,90,0.2)', letterSpacing: '0.3em', margin: 0, animation: 'breatheText 11s ease-in-out infinite', animationDelay: '2s' }}>"but i wrote it."</p>
            </div>

            <div style={{ position: 'relative', zIndex: 10, width: 520, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)', transition: 'all 1.1s 0.2s cubic-bezier(0.16,1,0.3,1)', marginTop: '-10vh' }}>

                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 12, opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.7s ease' }}>
                        <div style={{ width: 32, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.65))' }} />
                        <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.65)', letterSpacing: '0.55em', textTransform: 'uppercase', margin: 0 }}>your archive</p>
                        <div style={{ width: 32, height: 1, background: 'linear-gradient(270deg, transparent, rgba(200,160,90,0.65))' }} />
                    </div>
                    <h1 style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 72, color: 'rgba(240,228,200,1)', letterSpacing: -1, margin: 0, lineHeight: 1, textShadow: '0 0 80px rgba(200,160,90,0.3)', opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.5s ease' }}>drafts.</h1>
                    <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 12, color: 'rgba(200,160,90,0.6)', marginTop: 10, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.8s ease' }}>never meant to be sent.</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,160,90,0.18)', borderRadius: 4, padding: '44px 48px 40px', backdropFilter: 'blur(28px)', boxShadow: '0 40px 140px rgba(0,0,0,0.8), inset 0 1px 0 rgba(200,160,90,0.12), 0 0 100px rgba(200,160,90,0.05)', position: 'relative', overflow: 'hidden' }}>

                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.45), transparent)' }} />

                    <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.55)', letterSpacing: '0.6em', textTransform: 'uppercase', margin: '0 0 28px' }}>welcome back</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <LoginField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@somewhere.com" focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
                        <LoginField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" focused={focused === 'password'} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} onEnter={handleSubmit} />
                    </div>

                    {error && (
                        <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 12, color: 'rgba(220,80,80,0.95)', marginTop: 16, letterSpacing: '0.15em', animation: 'shakeErr 0.4s ease forwards' }}>{error}</p>
                    )}

                    <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: 30, padding: '18px', border: '1px solid rgba(200,160,90,0.45)', borderRadius: 3, background: loading ? 'rgba(200,160,90,0.1)' : 'linear-gradient(135deg, rgba(200,160,90,0.3), rgba(175,125,55,0.35))', color: loading ? 'rgba(200,160,90,0.45)' : 'rgba(200,160,90,1)', fontSize: 13, cursor: loading ? 'not-allowed' : 'none', fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', letterSpacing: '0.3em', textTransform: 'uppercase', transition: 'all 0.35s ease', boxShadow: loading ? 'none' : '0 0 40px rgba(200,160,90,0.15), inset 0 1px 0 rgba(200,160,90,0.2)' }}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,160,90,0.4), rgba(175,125,55,0.45))'; e.currentTarget.style.borderColor = 'rgba(200,160,90,0.7)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(200,160,90,0.25), inset 0 1px 0 rgba(200,160,90,0.25)'; e.currentTarget.style.letterSpacing = '0.38em' } }}
                        onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,160,90,0.3), rgba(175,125,55,0.35))'; e.currentTarget.style.borderColor = 'rgba(200,160,90,0.45)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(200,160,90,0.15), inset 0 1px 0 rgba(200,160,90,0.2)'; e.currentTarget.style.letterSpacing = '0.3em' } }}>
                        {loading ? 'opening...' : 'open my drafts'}
                    </button>

                    <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(200,160,90,0.15)' }} />
                        <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 11, color: 'rgba(200,160,90,0.45)', margin: 0, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
                            no account?{' '}
                            <Link to="/register" style={{ color: 'rgba(200,160,90,0.85)', textDecoration: 'none', transition: 'color 0.25s ease' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(200,160,90,1)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,160,90,0.85)')}>start writing</Link>
                        </p>
                        <div style={{ flex: 1, height: 1, background: 'rgba(200,160,90,0.15)' }} />
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');
                @keyframes inkFade {
                    0%   { opacity: 0.85; }
                    100% { opacity: 0; transform: scaleX(1.5); }
                }
                @keyframes shakeErr {
                    0%,100% { transform: translateX(0); }
                    20%     { transform: translateX(-6px); }
                    40%     { transform: translateX(6px); }
                    60%     { transform: translateX(-4px); }
                    80%     { transform: translateX(4px); }
                }
                @keyframes fieldGlow {
                    0%,100% { opacity: 0.6; }
                    50%     { opacity: 1; }
                }
                @keyframes driftL {
                    0%,100% { transform: translateX(var(--tx,0px)) translateY(0px); }
                    50%     { transform: translateX(var(--tx,0px)) translateY(-6px); }
                }
                @keyframes driftR {
                    0%,100% { transform: translateX(var(--tx,0px)) translateY(0px); }
                    50%     { transform: translateX(var(--tx,0px)) translateY(-6px); }
                }
                @keyframes floatGlyph {
                    0%,100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
                    33%     { transform: translateY(-8px) rotate(5deg); opacity: 1; }
                    66%     { transform: translateY(-4px) rotate(-3deg); opacity: 0.9; }
                }
                @keyframes breatheText {
                    0%,100% { opacity: 0.8; letter-spacing: 0.3em; }
                    50%     { opacity: 1; letter-spacing: 0.45em; }
                }
                * { box-sizing: border-box; }
                input::placeholder { color: rgba(200,160,90,0.4); font-style: italic; }
                input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0a0a0a inset !important; -webkit-text-fill-color: rgba(240,228,200,0.95) !important; }
            `}</style>
        </div>
    )
}

function LoginField({ label, type, value, onChange, placeholder, focused, onFocus, onBlur, onEnter }: {
    label: string; type: string; value: string
    onChange: (v: string) => void; placeholder: string
    focused: boolean; onFocus: () => void; onBlur: () => void; onEnter?: () => void
}) {
    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: focused ? 'rgba(200,160,90,0.85)' : 'rgba(200,160,90,0.5)', letterSpacing: '0.55em', textTransform: 'uppercase', transition: 'color 0.3s ease' }}>
                <div style={{ width: focused ? 16 : 6, height: 1, background: focused ? 'rgba(200,160,90,0.8)' : 'rgba(200,160,90,0.4)', transition: 'all 0.3s ease' }} />
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onEnter?.()}
                    onFocus={onFocus} onBlur={onBlur}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '15px 20px', background: focused ? 'rgba(200,160,90,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${focused ? 'rgba(200,160,90,0.55)' : 'rgba(200,160,90,0.25)'}`, borderRadius: 3, color: 'rgba(240,228,200,0.95)', fontSize: 14, outline: 'none', fontFamily: "'Palatino Linotype', Palatino, serif", transition: 'all 0.3s ease', boxShadow: focused ? '0 0 28px rgba(200,160,90,0.15), inset 0 1px 0 rgba(200,160,90,0.1)' : 'none', letterSpacing: type === 'password' ? 4 : 0.3 }}
                />
                {focused && (
                    <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.65), transparent)', animation: 'fieldGlow 2s ease-in-out infinite' }} />
                )}
            </div>
        </div>
    )
}
