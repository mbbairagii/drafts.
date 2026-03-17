import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDiary } from '../hooks/useDiary'
import type { Diary } from '../types'
import Footer from '../components/ui/Footer'
import { COVER_STYLES } from '../utils/constants'
import bgImg from '../assets/03.png'

const SERIF = "'Libre Baskerville', Georgia, serif"
const SANS = "'DM Sans', sans-serif"

const COVERS = Object.fromEntries(
    COVER_STYLES.map(c => [c.id, { spine: c.spine, body: c.body, text: c.accent, glow: c.glow, label: c.label }])
)

export default function HomeScreen() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { diaries, fetchDiaries, createDiary, deleteDiary, unlockDiary } = useDiary()

    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [newName, setNewName] = useState('')
    const [newCover, setNewCover] = useState('void')
    const [newPassword, setNewPassword] = useState('')
    const [newConfirm, setNewConfirm] = useState('')
    const [newPassErr, setNewPassErr] = useState('')
    const [showNewPass, setShowNewPass] = useState(false)
    const [showNewConf, setShowNewConf] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [unlockTarget, setUnlockTarget] = useState<Diary | null>(null)
    const [unlockPass, setUnlockPass] = useState('')
    const [unlockErr, setUnlockErr] = useState('')
    const [unlocking, setUnlocking] = useState(false)
    const [showUnlockPass, setShowUnlockPass] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; dur: number; delay: number }[]>([])

    const nameRef = useRef<HTMLInputElement>(null)

    useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

    useEffect(() => {
        setParticles(Array.from({ length: 38 }, (_, i) => ({
            id: i, x: Math.random() * 100, y: Math.random() * 100,
            size: 1 + Math.random() * 2.5, dur: 4 + Math.random() * 6, delay: Math.random() * 5,
        })))
    }, [])

    useEffect(() => {
        if (!user) return
        fetchDiaries().finally(() => setLoading(false))
    }, [user])

    useEffect(() => {
        if (showNew) setTimeout(() => nameRef.current?.focus(), 80)
    }, [showNew])

    const handleCreate = async () => {
        if (!newName.trim()) return
        if (!newPassword || newPassword.length < 4) { setNewPassErr('Min 4 characters required.'); return }
        if (newPassword !== newConfirm) { setNewPassErr('Passwords do not match.'); return }
        setNewPassErr(''); setCreating(true)
        try {
            const diary = await createDiary(newName.trim(), newCover, newPassword)
            setShowNew(false); setNewName(''); setNewCover('void'); setNewPassword(''); setNewConfirm('')
            navigate(`/diary/${diary._id}`)
        } catch { setCreating(false) }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!window.confirm('Delete this diary?')) return
        setDeletingId(id)
        try { await deleteDiary(id) } finally { setDeletingId(null) }
    }

    const handleUnlock = async () => {
        if (!unlockTarget || !unlockPass) return
        setUnlocking(true); setUnlockErr('')
        try {
            const ok = await unlockDiary(unlockTarget._id, unlockPass)
            if (ok) { setUnlockTarget(null); navigate(`/diary/${unlockTarget._id}`) }
            else setUnlockErr('Wrong password. Try again.')
        } catch { setUnlockErr('Wrong password. Try again.') }
        finally { setUnlocking(false) }
    }

    const resetNew = () => {
        setShowNew(false); setNewName(''); setNewPassword(''); setNewConfirm('')
        setNewPassErr(''); setShowNewPass(false); setShowNewConf(false)
    }
    const resetUnlock = () => { setUnlockTarget(null); setUnlockPass(''); setUnlockErr(''); setShowUnlockPass(false) }

    const safeList: Diary[] = Array.isArray(diaries) ? diaries : []

    if (loading) return (
        <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`@keyframes breathe{0%,100%{opacity:.15}50%{opacity:.6}}`}</style>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 32, color: 'rgba(237,232,223,0.5)', margin: 0, animation: 'breathe 2.2s ease-in-out infinite' }}>drafts.</p>
            <Footer />
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: 'rgba(237,232,223,0.85)', fontFamily: SANS, position: 'relative', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=IM+Fell+English:ital@1&display=swap');
                @keyframes fadein    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes floatin   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
                @keyframes particle  { 0%{transform:translateY(0);opacity:0} 20%{opacity:.7} 80%{opacity:.3} 100%{transform:translateY(-110px);opacity:0} }
                @keyframes unlock-in { from{opacity:0;transform:scale(0.92) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
                @keyframes glow-pulse{ 0%,100%{opacity:.5} 50%{opacity:1} }
                @keyframes spin      { to{transform:rotate(360deg)} }
                @keyframes shimmer   { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
                * { box-sizing:border-box }
                ::-webkit-scrollbar{width:3px}
                ::-webkit-scrollbar-thumb{background:rgba(200,160,90,.12);border-radius:2px}
                input::placeholder{color:rgba(237,232,223,.18);font-style:italic}
                input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #050505 inset!important;-webkit-text-fill-color:rgba(237,232,223,.9)!important}
            `}</style>

            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.22, pointerEvents: 'none', filter: 'brightness(1.6) saturate(0.6)' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.82) 50%, rgba(0,0,0,0.97) 100%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 75% 55% at 50% 18%, rgba(40,35,80,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'1\' height=\'1\' fill=\'rgba(255,255,255,0.014)\'/%3E%3C/svg%3E")', pointerEvents: 'none' }} />

            {/* Particles */}
            {particles.map(p => (
                <div key={p.id} style={{ position: 'fixed', left: `${p.x}%`, bottom: `${p.y * 0.35}%`, width: p.size, height: p.size, borderRadius: '50%', backgroundColor: 'rgba(200,160,90,0.45)', pointerEvents: 'none', zIndex: 1, animation: `particle ${p.dur}s ${p.delay}s ease-out infinite` }} />
            ))}

            {/* Unlock modal */}
            {unlockTarget && (() => {
                const mc = COVERS[unlockTarget.cover] || COVERS.void
                return (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)' }}
                        onClick={e => { if (e.target === e.currentTarget) resetUnlock() }}>
                        <div style={{ width: 400, animation: 'unlock-in 0.35s cubic-bezier(0.2,1,0.3,1) both' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                                <div style={{ display: 'flex', filter: `drop-shadow(0 8px 32px ${mc.glow})`, animation: 'shimmer 3s ease-in-out infinite' }}>
                                    <div style={{ width: 16, height: 110, background: `linear-gradient(180deg, ${mc.spine}, rgba(0,0,0,0.6))`, borderRadius: '4px 0 0 4px', boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.5)' }} />
                                    <div style={{ width: 76, height: 110, background: `linear-gradient(135deg, ${mc.body} 0%, ${mc.spine} 70%)`, borderRadius: '0 6px 6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 8px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, height: 1, background: `linear-gradient(90deg,transparent,${mc.text}40,transparent)` }} />
                                        <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, height: 1, background: `linear-gradient(90deg,transparent,${mc.text}40,transparent)` }} />
                                        <span style={{ fontSize: 18 }}>🔒</span>
                                        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 9, color: mc.text, margin: 0, textAlign: 'center', lineHeight: 1.3, opacity: 0.9 }}>{unlockTarget.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(4,3,8,0.98)', border: `1px solid ${mc.text}20`, borderRadius: 14, padding: '28px 32px 24px', boxShadow: `0 32px 100px rgba(0,0,0,0.98), 0 0 60px ${mc.glow}12` }}>
                                <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${mc.text}45,transparent)`, marginBottom: 20 }} />
                                <p style={{ margin: '0 0 4px', fontSize: 8, letterSpacing: '0.55em', color: `${mc.text}55`, textTransform: 'uppercase', textAlign: 'center' }}>locked diary</p>
                                <h3 style={{ margin: '0 0 20px', fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: 'rgba(237,232,223,0.92)', textAlign: 'center', textShadow: `0 0 30px ${mc.glow}` }}>{unlockTarget.name}</h3>

                                <div style={{ position: 'relative', marginBottom: 8 }}>
                                    <input autoFocus type={showUnlockPass ? 'text' : 'password'} value={unlockPass}
                                        onChange={e => { setUnlockPass(e.target.value); setUnlockErr('') }}
                                        onKeyDown={e => { if (e.key === 'Enter') handleUnlock(); if (e.key === 'Escape') resetUnlock() }}
                                        placeholder="enter password…"
                                        style={{ width: '100%', padding: '13px 44px 13px 16px', borderRadius: 9, border: `1px solid ${unlockErr ? 'rgba(255,80,80,0.45)' : mc.text + '28'}`, backgroundColor: 'rgba(255,255,255,0.025)', color: 'rgba(237,232,223,0.92)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, outline: 'none', caretColor: mc.text, letterSpacing: showUnlockPass ? 'normal' : 4, transition: 'border-color 0.2s', animation: unlockErr ? 'shake 0.4s both' : 'none' }}
                                    />
                                    <button onClick={() => setShowUnlockPass(v => !v)} tabIndex={-1}
                                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: `${mc.text}55`, fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                                        {showUnlockPass ? '🙈' : '👁'}
                                    </button>
                                </div>
                                {unlockErr && <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,100,100,0.8)', fontStyle: 'italic', textAlign: 'center' }}>{unlockErr}</p>}

                                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                    <button onClick={handleUnlock} disabled={unlocking || !unlockPass}
                                        style={{ flex: 1, padding: '12px', borderRadius: 9, border: `1px solid ${mc.text}45`, background: `linear-gradient(135deg, ${mc.spine}dd, ${mc.body}dd)`, color: mc.text, cursor: !unlockPass ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.3em', fontFamily: SANS, outline: 'none', opacity: !unlockPass ? 0.35 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: unlockPass ? `0 0 24px ${mc.glow}35` : 'none' }}>
                                        {unlocking && <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${mc.text}`, borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                                        {unlocking ? 'opening…' : '✦ open diary'}
                                    </button>
                                    <button onClick={resetUnlock}
                                        style={{ padding: '12px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'rgba(237,232,223,0.22)', cursor: 'pointer', fontSize: 11, fontFamily: SANS, outline: 'none', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(237,232,223,0.5)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(237,232,223,0.22)'}>
                                        cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* New diary modal */}
            {showNew && (() => {
                const pc = COVERS[newCover] || COVERS.void
                return (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
                        onClick={e => { if (e.target === e.currentTarget) resetNew() }}>
                        <div style={{ width: 460, backgroundColor: 'rgba(4,3,8,0.99)', border: `1px solid ${pc.text}18`, borderRadius: 16, padding: '34px 38px 30px', boxShadow: `0 40px 120px rgba(0,0,0,0.99), 0 0 50px ${pc.glow}10`, animation: 'unlock-in 0.3s cubic-bezier(0.2,1,0.3,1) both', transition: 'box-shadow 0.3s, border-color 0.3s' }}>
                            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${pc.text}45,transparent)`, marginBottom: 22 }} />
                            <p style={{ margin: '0 0 3px', fontSize: 8, letterSpacing: '0.55em', color: `${pc.text}55`, textTransform: 'uppercase' }}>new diary</p>
                            <h3 style={{ margin: '0 0 22px', fontFamily: SERIF, fontStyle: 'italic', fontSize: 21, color: 'rgba(237,232,223,0.88)' }}>Begin a new chapter</h3>

                            <input ref={nameRef} value={newName} onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') resetNew() }}
                                placeholder="give it a name…"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.025)', color: 'rgba(237,232,223,0.9)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, outline: 'none', caretColor: 'rgba(200,160,90,0.8)', marginBottom: 10 }}
                            />

                            <div style={{ position: 'relative', marginBottom: 10 }}>
                                <input type={showNewPass ? 'text' : 'password'} value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setNewPassErr('') }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                                    placeholder="set a password…"
                                    style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 9, border: `1px solid ${newPassErr ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.06)'}`, backgroundColor: 'rgba(255,255,255,0.025)', color: 'rgba(237,232,223,0.9)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, outline: 'none', caretColor: 'rgba(200,160,90,0.8)', letterSpacing: showNewPass ? 'normal' : 3 }}
                                />
                                <button onClick={() => setShowNewPass(v => !v)} tabIndex={-1}
                                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(237,232,223,0.28)', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                                    {showNewPass ? '🙈' : '👁'}
                                </button>
                            </div>

                            <div style={{ position: 'relative', marginBottom: 4 }}>
                                <input type={showNewConf ? 'text' : 'password'} value={newConfirm}
                                    onChange={e => { setNewConfirm(e.target.value); setNewPassErr('') }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                                    placeholder="confirm password…"
                                    style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 9, border: `1px solid ${newPassErr ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.06)'}`, backgroundColor: 'rgba(255,255,255,0.025)', color: 'rgba(237,232,223,0.9)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, outline: 'none', caretColor: 'rgba(200,160,90,0.8)', letterSpacing: showNewConf ? 'normal' : 3 }}
                                />
                                <button onClick={() => setShowNewConf(v => !v)} tabIndex={-1}
                                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(237,232,223,0.28)', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                                    {showNewConf ? '🙈' : '👁'}
                                </button>
                            </div>
                            {newPassErr && <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(255,100,100,0.8)', fontStyle: 'italic' }}>{newPassErr}</p>}

                            {/* Cover picker */}
                            <div style={{ marginTop: 16, marginBottom: 22 }}>
                                <p style={{ margin: '0 0 10px', fontSize: 8, letterSpacing: '0.4em', color: 'rgba(237,232,223,0.16)', textTransform: 'uppercase' }}>cover</p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {COVER_STYLES.map(c => (
                                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                            <button onClick={() => setNewCover(c.id)} title={c.label}
                                                style={{ width: 34, height: 44, borderRadius: 4, border: newCover === c.id ? `2px solid ${c.accent}` : '2px solid rgba(255,255,255,0.05)', backgroundImage: `url(${c.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', outline: newCover === c.id ? `2px solid ${c.accent}30` : 'none', outlineOffset: 2, transition: 'all 0.15s', boxShadow: newCover === c.id ? `0 0 18px ${c.glow}` : 'none', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: c.spine, opacity: 0.8 }} />
                                            </button>
                                            <p style={{ margin: 0, fontSize: 7, color: newCover === c.id ? `${c.accent}cc` : 'rgba(237,232,223,0.2)', fontFamily: SANS, letterSpacing: '0.05em', transition: 'color 0.15s' }}>{c.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={handleCreate} disabled={creating || !newName.trim()}
                                    style={{ flex: 1, padding: '13px', borderRadius: 9, border: `1px solid ${pc.text}40`, background: `linear-gradient(135deg, ${pc.spine}cc, ${pc.body}cc)`, color: pc.text, cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em', fontFamily: SANS, outline: 'none', opacity: !newName.trim() ? 0.35 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: newName.trim() ? `0 0 20px ${pc.glow}28` : 'none' }}>
                                    {creating && <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${pc.text}`, borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                                    {creating ? 'creating…' : 'create diary'}
                                </button>
                                <button onClick={resetNew}
                                    style={{ padding: '13px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'rgba(237,232,223,0.22)', cursor: 'pointer', fontSize: 11, fontFamily: SANS, outline: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(237,232,223,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(237,232,223,0.22)'}>
                                    cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* Page */}
            <div style={{ position: 'relative', zIndex: 2 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 52px 0', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(-10px)', transition: 'all 0.7s ease' }}>
                    <h1 style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 28, color: 'rgba(237,232,223,0.88)', margin: 0, textShadow: '0 0 40px rgba(200,160,90,0.2)' }}>drafts.</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 11, color: 'rgba(237,232,223,0.18)', letterSpacing: '0.06em' }}>{user?.email}</span>
                        <button onClick={logout}
                            style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'rgba(237,232,223,0.22)', cursor: 'pointer', fontSize: 11, letterSpacing: '0.1em', outline: 'none', fontFamily: SANS, transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,70,70,0.35)'; e.currentTarget.style.color = 'rgba(255,100,100,0.65)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(237,232,223,0.22)' }}>
                            sign out
                        </button>
                    </div>
                </div>

                {/* Hero */}
                <div style={{ textAlign: 'center', padding: '72px 48px 54px', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 1s 0.1s ease' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 44, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,160,90,0.4))' }} />
                        <p style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(200,160,90,0.5)', letterSpacing: '0.6em', textTransform: 'uppercase', margin: 0 }}>your private archive</p>
                        <div style={{ width: 44, height: 1, background: 'linear-gradient(270deg,transparent,rgba(200,160,90,0.4))' }} />
                    </div>
                    <h2 style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 62px)', color: 'rgba(237,232,223,0.9)', margin: '0 0 14px', lineHeight: 1.1, textShadow: '0 0 80px rgba(200,160,90,0.14)' }}>
                        {safeList.length === 0 ? 'Your pages are waiting.' : safeList.length === 1 ? 'One diary.' : `${safeList.length} diaries.`}
                    </h2>
                    <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: 'rgba(237,232,223,0.32)', margin: '0 0 8px', lineHeight: 1.7 }}>
                        Welcome back, <span style={{ color: 'rgba(200,160,90,0.65)', fontStyle: 'normal' }}>{user?.email?.split('@')[0]}</span>.
                    </p>
                    <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 12, color: 'rgba(237,232,223,0.14)', margin: '0 0 34px', letterSpacing: '0.18em' }}>
                        {safeList.length === 0
                            ? 'Every great story begins with a single page.'
                            : safeList.length === 1
                                ? 'Your diary awaits — locked, kept, yours.'
                                : 'All your memories, locked away safely.'}
                    </p>
                    <button onClick={() => setShowNew(true)}
                        style={{ padding: '13px 34px', borderRadius: 3, border: '1px solid rgba(200,160,90,0.28)', background: 'rgba(200,160,90,0.06)', color: 'rgba(200,160,90,0.75)', cursor: 'pointer', fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', fontFamily: SANS, outline: 'none', transition: 'all 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,160,90,0.12)'; e.currentTarget.style.borderColor = 'rgba(200,160,90,0.55)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(200,160,90,0.14)'; e.currentTarget.style.letterSpacing = '0.6em' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,160,90,0.06)'; e.currentTarget.style.borderColor = 'rgba(200,160,90,0.28)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.letterSpacing = '0.5em' }}>
                        + new diary
                    </button>
                </div>

                {/* Shelf */}
                {safeList.length > 0 && (
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 52px 120px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.3s' }}>
                            <div style={{ flex: 1, height: 1, background: 'rgba(200,160,90,0.08)' }} />
                            <p style={{ fontFamily: SANS, fontSize: 8, color: 'rgba(200,160,90,0.3)', letterSpacing: '0.5em', textTransform: 'uppercase', margin: 0 }}>your diaries</p>
                            <div style={{ flex: 1, height: 1, background: 'rgba(200,160,90,0.08)' }} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center' }}>
                            {safeList.map((diary, idx) => (
                                <DiaryCard key={diary._id} diary={diary} idx={idx}
                                    isDeleting={deletingId === diary._id}
                                    onClick={() => { setUnlockTarget(diary); setUnlockPass(''); setUnlockErr(''); setShowUnlockPass(false) }}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {safeList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '10px 0 120px', opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.4s' }}>
                        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: 'rgba(237,232,223,0.08)', margin: 0 }}>No diaries yet. Begin one above.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

function DiaryCard({ diary, idx, isDeleting, onClick, onDelete }: {
    diary: Diary; idx: number; isDeleting: boolean
    onClick: () => void; onDelete: (e: React.MouseEvent, id: string) => void
}) {
    const [hovered, setHovered] = useState(false)
    const c = COVERS[diary.cover] || COVERS.void

    return (
        <div
            style={{ position: 'relative', animation: `floatin 0.6s ${idx * 0.07}s cubic-bezier(0.2,1,0.3,1) both` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {hovered && (
                <button onClick={e => onDelete(e, diary._id)} disabled={isDeleting}
                    style={{ position: 'absolute', top: -10, right: -8, zIndex: 10, width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(255,60,60,0.28)', backgroundColor: 'rgba(4,3,8,0.97)', color: 'rgba(255,80,80,0.6)', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,40,40,0.16)'; e.currentTarget.style.color = 'rgba(255,100,100,1)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(4,3,8,0.97)'; e.currentTarget.style.color = 'rgba(255,80,80,0.6)' }}>
                    {isDeleting ? '…' : '×'}
                </button>
            )}

            <div onClick={onClick}
                style={{ cursor: 'pointer', display: 'flex', transition: 'transform 0.38s cubic-bezier(0.2,1,0.3,1)', transform: hovered ? 'translateY(-12px) rotate(-1.5deg)' : 'translateY(0) rotate(-1deg)' }}>

                <div style={{ width: 20, height: 210, background: `linear-gradient(180deg, ${c.spine} 0%, rgba(0,0,0,0.6) 100%)`, borderRadius: '4px 0 0 4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset -4px 0 10px rgba(0,0,0,0.6)${hovered ? `, 0 0 18px ${c.glow}` : ''}`, transition: 'box-shadow 0.35s' }}>
                    <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: 'italic', fontSize: 7, color: `${c.text}45`, writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.25em', margin: 0, maxHeight: 160, overflow: 'hidden', whiteSpace: 'nowrap' }}>drafts.</p>
                </div>

                <div style={{ width: 138, height: 210, backgroundImage: `url(${COVER_STYLES.find(s => s.id === diary.cover)?.bgImage || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '0 6px 6px 0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 14px', gap: 10, transition: 'box-shadow 0.35s', boxShadow: hovered ? `6px 10px 36px rgba(0,0,0,0.8), 0 0 45px ${c.glow}40, inset 0 1px 0 rgba(255,255,255,0.05)` : `4px 6px 22px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)` }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: `${c.spine}88` }} />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{ position: 'absolute', right: 0, top: `${18 + i * 15}%`, width: 3, height: '3%', backgroundColor: 'rgba(237,232,223,0.04)', borderRadius: 1 }} />
                    ))}
                    <div style={{ position: 'absolute', top: 12, left: 14, right: 14, height: 1, background: `linear-gradient(90deg,transparent,${c.text}28,transparent)` }} />
                    <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, height: 1, background: `linear-gradient(90deg,transparent,${c.text}28,transparent)` }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 7, color: `${c.text}40`, letterSpacing: '0.55em', textTransform: 'uppercase', margin: 0, position: 'relative' }}>locked</p>
                    <span style={{ fontSize: 22, animation: hovered ? 'glow-pulse 1.6s ease-in-out infinite' : 'none', position: 'relative' }}>🔒</span>
                    <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: 'italic', fontSize: 13, color: `${c.text}e0`, margin: 0, textAlign: 'center', lineHeight: 1.4, wordBreak: 'break-word', textShadow: hovered ? `0 0 18px ${c.glow}` : 'none', transition: 'text-shadow 0.3s', position: 'relative' }}>{diary.name}</p>
                    {diary.updatedAt && (
                        <p style={{ fontSize: 8, color: `${c.text}35`, margin: 0, letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
                            {new Date(diary.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>

            <div style={{ width: 158, height: 8, background: `radial-gradient(ellipse,rgba(0,0,0,0.6) 0%,transparent 70%)`, margin: '3px auto 0', transform: hovered ? 'scaleX(0.75)' : 'scaleX(1)', transition: 'transform 0.38s', opacity: hovered ? 0.3 : 0.6 }} />
        </div>
    )
}
