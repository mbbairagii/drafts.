import { useEffect, useState, useRef } from 'react'
import bgImg from '../assets/03.png'
import { useNavigate } from 'react-router-dom'
import { useDiary } from '../hooks/useDiary'
import { useAuth } from '../hooks/useAuth'
import { COVER_STYLES } from '../utils/constants'
import { formatDate } from '../utils/helpers'
import type { Diary } from '../types'
import CreateDiaryModal from '../components/modals/CreateDiaryModal'
import UnlockModal from '../components/modals/UnlockModal'

const FONT = "'IM Fell English', Georgia, serif"
const SANS = "'Palatino Linotype', serif"
const OFF = 'rgba(245,242,237,0.95)'
const DIM = (a: number) => `rgba(245,242,237,${a})`

const SPARKS: { top: string; left: string; size: number; delay: number; dur: number }[] = [
    { top: '5%', left: '2%', size: 2, delay: 0, dur: 4.2 },
    { top: '15%', left: '12%', size: 3, delay: 1.2, dur: 5.1 },
    { top: '25%', left: '8%', size: 2, delay: 2.4, dur: 4.7 },
    { top: '35%', left: '1%', size: 3, delay: 0.6, dur: 6.0 },
    { top: '48%', left: '10%', size: 2, delay: 3.2, dur: 4.9 },
    { top: '65%', left: '4%', size: 3, delay: 1.1, dur: 5.5 },
    { top: '78%', left: '15%', size: 2, delay: 2.8, dur: 4.3 },
    { top: '92%', left: '6%', size: 3, delay: 1.6, dur: 5.8 },
    { top: '10%', left: '85%', size: 2, delay: 0.7, dur: 5.3 },
    { top: '22%', left: '94%', size: 3, delay: 1.9, dur: 4.6 },
    { top: '35%', left: '98%', size: 2, delay: 3.8, dur: 5.9 },
    { top: '52%', left: '88%', size: 3, delay: 1.4, dur: 4.8 },
    { top: '68%', left: '96%', size: 2, delay: 2.5, dur: 5.2 },
    { top: '82%', left: '82%', size: 3, delay: 0.4, dur: 4.5 },
    { top: '95%', left: '92%', size: 2, delay: 3.9, dur: 6.3 },
    { top: '40%', left: '50%', size: 2, delay: 2.1, dur: 5.6 },
    { top: '72%', left: '55%', size: 3, delay: 0.9, dur: 4.9 },
    { top: '15%', left: '60%', size: 2, delay: 3.0, dur: 6.0 },
    { top: '95%', left: '42%', size: 3, delay: 0.2, dur: 5.1 },
    { top: '55%', left: '30%', size: 2, delay: 4.5, dur: 4.6 },
]

export default function HomeScreen() {
    const { diaries, fetchDiaries, deleteDiary } = useDiary()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showCreate, setShowCreate] = useState(false)
    const [unlockTarget, setUnlockTarget] = useState<Diary | null>(null)
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        fetchDiaries().finally(() => setLoading(false))
    }, [fetchDiaries])

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
            if (frame % 10 === 0 && pts.length < 60) {
                const fromLeft = Math.random() > 0.5
                pts.push({
                    x: fromLeft ? -10 : canvas.width + 10,
                    y: canvas.height * 0.1 + Math.random() * canvas.height * 0.8,
                    vx: fromLeft ? 0.12 + Math.random() * 0.22 : -(0.12 + Math.random() * 0.22),
                    vy: -(0.02 + Math.random() * 0.12),
                    life: 0, max: 400 + Math.random() * 500,
                    r: 0.3 + Math.random() * 1.5,
                    hue: 35 + Math.random() * 20,
                })
            }
            for (let i = pts.length - 1; i >= 0; i--) {
                const p = pts[i]
                p.life++
                p.x += p.vx + Math.sin(p.life * 0.015 + i) * 0.12
                p.y += p.vy
                if (p.life >= p.max) { pts.splice(i, 1); continue }
                const pr = p.life / p.max
                const a = pr < 0.15 ? pr / 0.15 : pr > 0.75 ? 1 - (pr - 0.75) / 0.25 : 1
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${p.hue},40%,75%,${a * 0.22})`
                ctx.fill()
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current) }
    }, [])

    const handleOpenDiary = (diary: Diary) => {
        if (diary.passwordHash) setUnlockTarget(diary)
        else navigate(`/diary/${diary._id}`)
    }

    const handleUnlocked = (diary: Diary) => {
        setUnlockTarget(null)
        navigate(`/diary/${diary._id}`)
    }

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening'

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');
                @keyframes sparkle {
                    0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
                    40%,60% { opacity:0.8; transform:scale(1) rotate(180deg); }
                }
                @keyframes floatUp {
                    from { opacity:0; transform:translateY(32px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity:0; }
                    to   { opacity:1; }
                }
                @keyframes lineExpand {
                    from { transform:scaleX(0); }
                    to   { transform:scaleX(1); }
                }
                @keyframes revealText {
                    from { clip-path:inset(0 100% 0 0); opacity:0; }
                    to   { clip-path:inset(0 0% 0 0); opacity:1; }
                }
                @keyframes pulseGlow {
                    0%,100% { opacity:0.4; }
                    50%     { opacity:0.7; }
                }
                @keyframes smoothFloat {
                    from { opacity:0; transform:translateY(20px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes footerReveal {
                    from { opacity:0; transform:translateY(15px); }
                    to { opacity:1; transform:translateY(0); }
                }
                .smooth-float {
                    animation: smoothFloat 0.8s cubic-bezier(0.2, 1, 0.3, 1) both;
                }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(200,160,90,0.2); border-radius: 3px; }
            `}</style>

            <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <img src={bgImg} alt="" style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: 0.2,
                }} />
            </div>



            {SPARKS.map((s, i) => (
                <div key={i} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 2, top: s.top, left: s.left, width: s.size * 5, height: s.size * 5, animation: `sparkle ${s.dur}s ${s.delay}s ease-in-out infinite` }}>
                    <div style={{ position: 'absolute', width: '100%', height: 1, top: '50%', left: 0, transform: 'translateY(-50%)', background: 'rgba(200,160,90,.7)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', height: '100%', width: 1, left: '50%', top: 0, transform: 'translateX(-50%)', background: 'rgba(200,160,90,.7)', borderRadius: 2 }} />
                </div>
            ))}

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '94%', margin: '0 auto', padding: '0 24px', flex: 1, width: '100%' }}>

                <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '40px 0 32px', opacity: mounted ? 1 : 0, animation: mounted ? 'floatUp 1s 0.1s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}>
                    <div>
                        <h1 style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 44, color: OFF, margin: 0, letterSpacing: -0.8, textShadow: '0 0 60px rgba(200,160,90,0.25)' }}>drafts.</h1>
                        <p style={{ color: DIM(.3), fontSize: 11, marginTop: 4, fontFamily: SANS, letterSpacing: '0.4em', textTransform: 'uppercase', fontStyle: 'italic', margin: '4px 0 0' }}>never meant to be sent.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingTop: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: DIM(.3), fontSize: 10, fontFamily: SANS, letterSpacing: '0.45em', textTransform: 'uppercase', margin: 0 }}>signed in as</p>
                            <p style={{ color: DIM(.7), fontSize: 15, fontFamily: FONT, fontStyle: 'italic', margin: '2px 0 0' }}>{user?.username}</p>
                        </div>
                        <div style={{ width: 1, height: 36, background: DIM(.12) }} />
                        <button onClick={logout} style={{ padding: '10px 24px', border: '1px solid rgba(245,242,237,0.1)', background: 'transparent', color: DIM(.4), cursor: 'pointer', fontSize: 10, fontFamily: SANS, letterSpacing: '0.45em', textTransform: 'uppercase', transition: 'all 0.3s', borderRadius: 2, outline: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,50,70,0.4)'; e.currentTarget.style.color = 'rgba(255,100,100,0.9)'; e.currentTarget.style.background = 'rgba(255,50,70,0.04)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,242,237,0.1)'; e.currentTarget.style.color = DIM(.4); e.currentTarget.style.background = 'transparent' }}>
                            sign out
                        </button>
                    </div>
                </header>

                <div style={{ marginBottom: 44, opacity: mounted ? 1 : 0, animation: mounted ? 'floatUp 1s 0.25s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                        <div style={{ height: 1, width: 28, background: 'linear-gradient(to right, transparent, rgba(200,160,90,0.5))', transformOrigin: 'left', animation: mounted ? 'lineExpand 0.9s 0.6s both' : 'none' }} />
                        <p style={{ fontFamily: SANS, fontSize: 9, color: DIM(.4), letterSpacing: '0.65em', textTransform: 'uppercase', margin: 0 }}>welcome back</p>
                    </div>
                    <h2 style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 'clamp(32px,4vw,52px)', color: OFF, margin: 0, letterSpacing: '-0.03em', animation: mounted ? 'revealText 1.2s 0.4s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}>{greeting}, {user?.username}.</h2>
                    <p style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 14, color: DIM(.35), marginTop: 12, letterSpacing: '0.06em', opacity: mounted ? 1 : 0, animation: mounted ? 'fadeIn 1.2s 1.1s both' : 'none' }}>
                        {diaries.length === 0 ? 'your archive awaits its first secret.' : `you have ${diaries.length} ${diaries.length === 1 ? 'draft' : 'drafts'} kept safe here.`}
                    </p>
                </div>

                <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', opacity: mounted ? 1 : 0, animation: mounted ? 'floatUp 1s 0.4s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}>
                    <div style={{ paddingBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <p style={{ color: DIM(.4), fontSize: 10, letterSpacing: '0.6em', textTransform: 'uppercase', fontFamily: SANS, margin: 0 }}>Your Archive</p>
                            <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, rgba(200,160,90,0.35), transparent)' }} />
                        </div>
                        <p style={{ color: DIM(.25), fontSize: 13, marginTop: 6, fontFamily: FONT, fontStyle: 'italic', margin: '6px 0 0' }}>{diaries.length} {diaries.length === 1 ? 'diary' : 'diaries'}</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{ padding: '14px 32px', border: '1px solid rgba(200,160,90,0.4)', background: 'linear-gradient(135deg, rgba(200,160,90,0.15), rgba(160,110,40,0.2))', color: 'rgba(240,220,180,1)', cursor: 'pointer', fontSize: 11, fontFamily: SANS, letterSpacing: '0.48em', textTransform: 'uppercase', transition: 'all 0.4s ease', borderRadius: 2, boxShadow: '0 0 35px rgba(200,160,90,0.12)', outline: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,160,90,0.25), rgba(160,110,40,0.3))'; e.currentTarget.style.borderColor = 'rgba(200,160,90,0.7)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(200,160,90,0.2)'; e.currentTarget.style.letterSpacing = '0.54em' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,160,90,0.15), rgba(160,110,40,0.2))'; e.currentTarget.style.borderColor = 'rgba(200,160,90,0.4)'; e.currentTarget.style.boxShadow = '0 0 35px rgba(200,160,90,0.12)'; e.currentTarget.style.letterSpacing = '0.48em' }}>
                        + new draft
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 32 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ height: 320, borderRadius: 4, background: 'rgba(200,160,90,0.04)', border: '1px solid rgba(200,160,90,0.08)', animation: 'pulseGlow 2.5s ease infinite', animationDelay: `${i * 0.25}s` }} />
                        ))}
                    </div>
                ) : diaries.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 140, opacity: mounted ? 1 : 0, animation: mounted ? 'fadeIn 1.2s 0.8s both' : 'none' }}>
                        <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 14, color: DIM(.2), letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 16 }}>— no entries —</p>
                        <p style={{ color: DIM(.3), fontFamily: FONT, fontStyle: 'italic', fontSize: 24 }}>nothing written yet.</p>
                        <p style={{ color: DIM(.15), fontFamily: SANS, fontSize: 13, marginTop: 10, fontStyle: 'italic', letterSpacing: '0.12em' }}>start your first draft.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 32, paddingBottom: 80 }}>
                        {diaries.map((diary, i) => {
                            const cover = COVER_STYLES.find(c => c.id === diary.cover) || COVER_STYLES[0]
                            const isHovered = hoveredId === diary._id
                            const isConfirming = deleteConfirm === diary._id

                            return (
                                <div key={diary._id} className="smooth-float" style={{ position: 'relative', animationDelay: `${0.6 + i * 0.1}s` }}>
                                    <div
                                        onClick={() => !isConfirming && handleOpenDiary(diary)}
                                        onMouseEnter={() => setHoveredId(diary._id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        style={{ cursor: 'pointer', transform: isHovered ? 'translateY(-12px) rotate(-1.5deg)' : 'translateY(0) rotate(0)', transition: 'all 0.5s cubic-bezier(0.3, 1.4, 0.5, 1)', filter: isHovered ? `drop-shadow(0 28px 56px rgba(0,0,0,0.9)) drop-shadow(0 0 32px ${cover.glow}50)` : 'drop-shadow(0 10px 24px rgba(0,0,0,0.75))' }}
                                    >
                                        <div style={{ height: 280, background: cover.bg, borderRadius: '4px 4px 0 0', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, background: cover.accent + '40', boxShadow: `inset -4px 0 10px rgba(0,0,0,0.75)` }} />
                                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 16px)' }} />
                                            {isHovered && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%,${cover.glow} 0%,transparent 75%)`, transition: 'opacity 0.5s' }} />}
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                                                <div style={{ width: '65%', height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />
                                                <h3 style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 20, color: '#fff', textShadow: `0 3px 14px rgba(0,0,0,0.95),0 0 24px ${cover.accent}70`, textAlign: 'center', margin: 0, lineHeight: 1.4 }}>{diary.name}</h3>
                                                <div style={{ width: '65%', height: 1, background: 'rgba(255,255,255,0.2)', marginTop: 16 }} />
                                                {diary.passwordHash && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 14, filter: `drop-shadow(0 0 8px ${cover.accent})` }}>🔒</div>}
                                                {isHovered && (
                                                    <div style={{ position: 'absolute', bottom: 16, background: `${cover.accent}35`, border: `1px solid ${cover.accent}70`, borderRadius: 2, padding: '6px 20px', color: '#fff', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', fontFamily: SANS, backdropFilter: 'blur(14px)', boxShadow: `0 0 25px ${cover.glow}50` }}>
                                                        open
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(18,18,18,0.9)', borderRadius: '0 0 4px 4px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', borderTop: `1px solid ${cover.accent}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                                            <div>
                                                <p style={{ color: DIM(.9), fontSize: 12, margin: 0, fontFamily: SANS, fontStyle: 'italic' }}>{diary.pageCount} {diary.pageCount === 1 ? 'page' : 'pages'}</p>
                                                <p style={{ color: DIM(.45), fontSize: 11, margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{formatDate(diary.createdAt)}</p>
                                            </div>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cover.accent, boxShadow: `0 0 10px ${cover.glow}, 0 0 20px ${cover.glow}` }} />
                                        </div>
                                    </div>

                                    {isConfirming ? (
                                        <div style={{ position: 'absolute', top: -10, right: -10, background: '#141414', border: '1px solid rgba(255,50,70,0.5)', borderRadius: 4, padding: '10px 14px', display: 'flex', gap: 10, zIndex: 20, boxShadow: '0 10px 32px rgba(0,0,0,0.9)', alignItems: 'center' }}>
                                            <span style={{ color: DIM(.7), fontSize: 11, fontFamily: SANS, fontStyle: 'italic', letterSpacing: '0.12em' }}>delete?</span>
                                            <button onClick={e => { e.stopPropagation(); deleteDiary(diary._id); setDeleteConfirm(null) }} style={{ background: 'rgba(255,50,70,0.3)', border: '1px solid rgba(255,50,70,0.65)', color: 'rgba(255,120,120,1)', borderRadius: 2, padding: '5px 14px', cursor: 'pointer', fontSize: 11, fontFamily: SANS, letterSpacing: '0.22em', outline: 'none' }}>yes</button>
                                            <button onClick={e => { e.stopPropagation(); setDeleteConfirm(null) }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: DIM(.7), borderRadius: 2, padding: '5px 14px', cursor: 'pointer', fontSize: 11, fontFamily: SANS, letterSpacing: '0.22em', outline: 'none' }}>no</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={e => { e.stopPropagation(); setDeleteConfirm(diary._id) }}
                                            style={{ position: 'absolute', top: -10, left: -10, background: '#141414', border: '1px solid rgba(255,255,255,0.15)', color: DIM(.5), borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'all 0.3s', zIndex: 20, outline: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.6)' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,50,70,0.7)'; e.currentTarget.style.color = 'rgba(255,110,110,1)'; e.currentTarget.style.background = 'rgba(255,50,70,0.08)' }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = DIM(.5); e.currentTarget.style.background = '#141414' }}
                                        >×</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <footer style={{ padding: '48px 48px 64px', textAlign: 'center', position: 'relative', zIndex: 10, opacity: mounted ? 1 : 0, animation: mounted ? 'footerReveal 1.4s 1.4s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}>
                <div style={{ width: 48, height: 1, background: 'linear-gradient(to right, transparent, rgba(200,160,90,0.5), transparent)', margin: '0 auto 24px' }} />
                <p style={{ fontFamily: SANS, fontSize: 11, color: DIM(.4), letterSpacing: '0.5em', textTransform: 'uppercase', margin: 0 }}>designed and developed by Mohini</p>
                <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 12, color: DIM(.2), marginTop: 10, letterSpacing: '0.12em' }}>✦ drafts. 2026 ✦</p>
            </footer>

            {showCreate && <CreateDiaryModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchDiaries() }} />}
            {unlockTarget && <UnlockModal diary={unlockTarget} onClose={() => setUnlockTarget(null)} onUnlocked={handleUnlocked} />}
        </div>
    )
}