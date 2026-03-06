import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiary } from '../hooks/useDiary'
import { useAuth } from '../hooks/useAuth'
import { COVER_STYLES } from '../utils/constants'
import { formatDate } from '../utils/helpers'
import type { Diary, CoverId } from '../types'
import CreateDiaryModal from '../components/modals/CreateDiaryModal'
import UnlockModal from '../components/modals/UnlockModal'

export default function HomeScreen() {
    const { diaries, fetchDiaries, deleteDiary } = useDiary()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showCreate, setShowCreate] = useState(false)
    const [unlockTarget, setUnlockTarget] = useState<Diary | null>(null)
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDiaries().finally(() => setLoading(false))
    }, [])

    const handleOpenDiary = (diary: Diary) => {
        if (diary.passwordHash) {
            setUnlockTarget(diary)
        } else {
            navigate(`/diary/${diary._id}`)
        }
    }

    const handleUnlocked = (diary: Diary) => {
        setUnlockTarget(null)
        navigate(`/diary/${diary._id}`)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0C0C0C', position: 'relative', overflowY: 'auto' }}>
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(26,107,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(108,99,255,0.03) 0%, transparent 50%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '36px 0 60px' }}>
                    <div>
                        <h1 style={{ fontFamily: "'IM Fell English', Georgia, serif", fontSize: 36, color: '#F5F2ED', margin: 0, letterSpacing: -0.5 }}>drafts.</h1>
                        <p style={{ color: '#3A3A3A', fontSize: 12, marginTop: 4, fontFamily: 'Georgia, serif', letterSpacing: 1 }}>never meant to be sent.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ color: '#3A3A3A', fontSize: 13, fontFamily: 'Georgia, serif' }}>{user?.username}</span>
                        <button onClick={logout} style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#6B6B6B', cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(255,34,68,0.3)'; (e.currentTarget).style.color = '#ff2244' }}
                            onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget).style.color = '#6B6B6B' }}>
                            sign out
                        </button>
                    </div>
                </header>

                <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ color: '#6B6B6B', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>Your Archive</p>
                        <p style={{ color: '#2a2a2a', fontSize: 13, marginTop: 4, fontFamily: 'Georgia, serif' }}>{diaries.length} {diaries.length === 1 ? 'diary' : 'diaries'}</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #1A6BFF, #6c63ff)', color: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: "'IM Fell English', Georgia, serif", letterSpacing: 0.5, boxShadow: '0 4px 20px rgba(26,107,255,0.3)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget).style.transform = 'translateY(-1px)'; (e.currentTarget).style.boxShadow = '0 8px 30px rgba(26,107,255,0.4)' }}
                        onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)'; (e.currentTarget).style.boxShadow = '0 4px 20px rgba(26,107,255,0.3)' }}
                    >
                        + new draft
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ width: 220, height: 300, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', animation: 'pulse-glow 2s ease infinite' }} />
                        ))}
                    </div>
                ) : diaries.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 100 }}>
                        <p style={{ fontSize: 48, marginBottom: 16, opacity: 0.15 }}>📔</p>
                        <p style={{ color: '#2a2a2a', fontFamily: "'IM Fell English', Georgia, serif", fontSize: 20 }}>Nothing written yet.</p>
                        <p style={{ color: '#1a1a1a', fontFamily: 'Georgia, serif', fontSize: 13, marginTop: 8 }}>Start your first draft.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 28 }}>
                        {diaries.map((diary, i) => {
                            const cover = COVER_STYLES.find(c => c.id === diary.cover) || COVER_STYLES[0]
                            const isHovered = hoveredId === diary._id
                            const isConfirming = deleteConfirm === diary._id

                            return (
                                <div key={diary._id} className="anim-float-in" style={{ position: 'relative', animationDelay: `${i * 0.07}s` }}>
                                    <div
                                        onClick={() => !isConfirming && handleOpenDiary(diary)}
                                        onMouseEnter={() => setHoveredId(diary._id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        style={{ cursor: 'pointer', transform: isHovered ? 'translateY(-8px) rotate(-1deg)' : 'translateY(0) rotate(0)', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', filter: isHovered ? `drop-shadow(0 20px 40px rgba(0,0,0,0.7)) drop-shadow(0 0 25px ${cover.glow})` : 'drop-shadow(0 6px 18px rgba(0,0,0,0.5))' }}
                                    >
                                        <div style={{ height: 250, background: cover.bg, borderRadius: '12px 12px 0 0', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, background: cover.accent + '30', boxShadow: `inset -3px 0 6px rgba(0,0,0,0.5)` }} />
                                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(0,0,0,0.03) 0px,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 12px)' }} />
                                            {isHovered && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%,${cover.glow} 0%,transparent 65%)`, transition: 'opacity 0.3s' }} />}
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                                                <div style={{ width: '65%', height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 12 }} />
                                                <h3 style={{ fontFamily: "'IM Fell English', Georgia, serif", fontSize: 18, color: '#fff', textShadow: `0 2px 8px rgba(0,0,0,0.8),0 0 16px ${cover.accent}50`, textAlign: 'center', margin: 0, lineHeight: 1.4 }}>{diary.name}</h3>
                                                <div style={{ width: '65%', height: 1, background: 'rgba(255,255,255,0.15)', marginTop: 12 }} />
                                                {diary.passwordHash && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 14, filter: `drop-shadow(0 0 6px ${cover.accent})` }}>🔒</div>}
                                                {isHovered && (
                                                    <div style={{ position: 'absolute', bottom: 16, background: `${cover.accent}25`, border: `1px solid ${cover.accent}50`, borderRadius: 16, padding: '5px 14px', color: cover.accent, fontSize: 11, letterSpacing: 1, backdropFilter: 'blur(8px)' }}>
                                                        open
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 12px 12px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ color: '#F5F2ED', fontSize: 11, margin: 0, fontFamily: 'Georgia, serif' }}>{diary.pageCount} {diary.pageCount === 1 ? 'page' : 'pages'}</p>
                                                <p style={{ color: '#2a2a2a', fontSize: 10, margin: '2px 0 0', fontFamily: 'monospace' }}>{formatDate(diary.createdAt)}</p>
                                            </div>
                                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cover.accent, boxShadow: `0 0 8px ${cover.glow}` }} />
                                        </div>
                                    </div>

                                    {isConfirming ? (
                                        <div style={{ position: 'absolute', top: -8, right: -8, background: '#0f0f0f', border: '1px solid rgba(255,34,68,0.3)', borderRadius: 12, padding: '8px 12px', display: 'flex', gap: 8, zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', alignItems: 'center' }}>
                                            <span style={{ color: '#6B6B6B', fontSize: 11, fontFamily: 'Georgia, serif' }}>delete?</span>
                                            <button onClick={e => { e.stopPropagation(); deleteDiary(diary._id); setDeleteConfirm(null) }} style={{ background: '#ff2244', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>yes</button>
                                            <button onClick={e => { e.stopPropagation(); setDeleteConfirm(null) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#6B6B6B', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>no</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={e => { e.stopPropagation(); setDeleteConfirm(diary._id) }}
                                            style={{ position: 'absolute', top: -8, left: -8, background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)', color: '#3a3a3a', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'all 0.2s', zIndex: 20 }}
                                            onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(255,34,68,0.4)'; (e.currentTarget).style.color = '#ff2244' }}
                                            onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.05)'; (e.currentTarget).style.color = '#3a3a3a' }}
                                        >×</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {showCreate && <CreateDiaryModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchDiaries() }} />}
            {unlockTarget && <UnlockModal diary={unlockTarget} onClose={() => setUnlockTarget(null)} onUnlocked={handleUnlocked} />}
        </div>
    )
}