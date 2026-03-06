import { useState, useRef, useEffect } from 'react'
import { useDiary } from '../../hooks/useDiary'
import { COVER_STYLES } from '../../utils/constants'
import type { Diary } from '../../types'

interface Props {
    diary: Diary
    onClose: () => void
    onUnlocked: (diary: Diary) => void
}

export default function UnlockModal({ diary, onClose, onUnlocked }: Props) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [shaking, setShaking] = useState(false)
    const [attempts, setAttempts] = useState(0)
    const { unlockDiary } = useDiary()
    const inputRef = useRef<HTMLInputElement>(null)
    const cover = COVER_STYLES.find(c => c.id === diary.cover) || COVER_STYLES[0]

    useEffect(() => { inputRef.current?.focus() }, [])

    const tryUnlock = async () => {
        const unlocked = await unlockDiary(diary._id, password)
        if (unlocked) {
            onUnlocked(diary)
        } else {
            setError(true); setShaking(true); setAttempts(a => a + 1)
            setTimeout(() => setShaking(false), 500)
            setPassword('')
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(16px)' }}>
            <div className={`anim-float-in ${shaking ? 'anim-shake' : ''}`} style={{ width: 380, background: '#0a0a0a', borderRadius: 24, border: `1px solid ${cover.accent}25`, boxShadow: `0 40px 100px rgba(0,0,0,0.9),0 0 60px ${cover.glow}`, overflow: 'hidden' }}>
                <div style={{ height: 140, background: cover.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 60%,${cover.glow} 0%,transparent 65%)` }} />
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                        <div style={{ fontSize: 36, marginBottom: 8, filter: `drop-shadow(0 0 16px ${cover.accent})` }}>🔒</div>
                        <p style={{ fontFamily: "'IM Fell English',Georgia,serif", fontSize: 18, color: '#fff', margin: 0, textShadow: `0 0 16px ${cover.accent}` }}>{diary.name}</p>
                    </div>
                </div>

                <div style={{ padding: '28px 32px 32px' }}>
                    <p style={{ color: '#3A3A3A', fontSize: 12, textAlign: 'center', marginBottom: 20, fontFamily: 'Georgia,serif' }}>
                        {attempts === 0 ? 'this draft is locked.' : `wrong. ${attempts} failed attempt${attempts > 1 ? 's' : ''}.`}
                    </p>

                    <input ref={inputRef} type="password" value={password}
                        onChange={e => { setPassword(e.target.value); setError(false) }}
                        onKeyDown={e => e.key === 'Enter' && tryUnlock()}
                        placeholder="enter password"
                        style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#ff224440' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, color: '#F5F2ED', fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia,serif', textAlign: 'center', letterSpacing: 4, marginBottom: 8, transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = `${cover.accent}60`}
                        onBlur={e => e.target.style.borderColor = error ? '#ff224440' : 'rgba(255,255,255,0.07)'} />

                    {error && <p style={{ color: '#ff2244', fontSize: 12, textAlign: 'center', marginBottom: 16, fontFamily: 'Georgia,serif' }}>wrong password.</p>}
                    {!error && <div style={{ height: 28 }} />}

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#6B6B6B', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13 }}>cancel</button>
                        <button onClick={tryUnlock} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${cover.accent},${cover.accent}cc)`, color: '#0a0a0a', cursor: 'pointer', fontFamily: "'IM Fell English',Georgia,serif", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${cover.glow}` }}>unlock</button>
                    </div>
                </div>
            </div>
        </div>
    )
}