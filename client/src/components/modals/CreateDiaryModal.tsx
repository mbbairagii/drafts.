import { useState } from 'react'
import { useDiary } from '../../hooks/useDiary'
import { COVER_STYLES } from '../../utils/constants'
import type { CoverId } from '../../types'

interface Props {
    onClose: () => void
    onCreated: () => void
}

export default function CreateDiaryModal({ onClose, onCreated }: Props) {
    const [step, setStep] = useState<1 | 2>(1)
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [cover, setCover] = useState<CoverId>('obsidian')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { createDiary } = useDiary()
    const coverStyle = COVER_STYLES.find(c => c.id === cover)!

    const handleNext = () => {
        if (!name.trim()) { setError('Give it a name.'); return }
        if (password && password !== confirm) { setError('Passwords don\'t match.'); return }
        setError(''); setStep(2)
    }

    const handleCreate = async () => {
        setLoading(true)
        try {
            await createDiary(name.trim(), cover, password || undefined)
            onCreated()
        } catch {
            setError('Failed to create. Try again.')
            setLoading(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
            <div className="anim-float-in" style={{ width: 520, background: '#0f0f0f', borderRadius: 22, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${coverStyle.accent},transparent)`, transition: 'background 0.4s' }} />
                <div style={{ padding: '36px 40px 40px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Georgia, serif' }}>step {step} of 2</p>
                    <h2 style={{ fontFamily: "'IM Fell English', Georgia, serif", fontSize: 30, color: '#F5F2ED', marginBottom: 28 }}>
                        {step === 1 ? 'Name this draft.' : 'Pick a cover.'}
                    </h2>

                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Draft Name" type="text" value={name} onChange={setName} placeholder="my unhinged thoughts..." />
                            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="optional — leave blank to skip" />
                            {password && <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="say it again" onEnter={handleNext} />}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                                {COVER_STYLES.map(c => (
                                    <div key={c.id} onClick={() => setCover(c.id)}
                                        style={{ height: 80, borderRadius: 12, background: c.bg, cursor: 'pointer', border: cover === c.id ? `2px solid ${c.accent}` : '2px solid transparent', boxShadow: cover === c.id ? `0 0 20px ${c.glow}` : 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                                        {cover === c.id && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle,${c.glow} 0%,transparent 70%)` }} />}
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.9)', zIndex: 1 }}>{c.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${coverStyle.accent}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 48, borderRadius: 4, background: coverStyle.bg, boxShadow: `0 0 12px ${coverStyle.glow}`, flexShrink: 0 }} />
                                <div>
                                    <p style={{ color: '#F5F2ED', fontSize: 14, fontFamily: "'Caveat',cursive", margin: 0 }}>{name}</p>
                                    <p style={{ color: '#3A3A3A', fontSize: 11, margin: '3px 0 0', fontFamily: 'Georgia,serif' }}>{coverStyle.name} · {password ? '🔒 locked' : '🔓 open'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <p style={{ color: '#FF2244', fontSize: 13, marginTop: 14, fontFamily: 'Georgia,serif' }}>{error}</p>}

                    <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                        <button onClick={step === 1 ? onClose : () => setStep(1)}
                            style={{ flex: 1, padding: '13px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#6B6B6B', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13 }}>
                            {step === 1 ? 'cancel' : '← back'}
                        </button>
                        <button onClick={step === 1 ? handleNext : handleCreate} disabled={loading}
                            style={{ flex: 2, padding: '13px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg,${coverStyle.accent},${coverStyle.accent}cc)`, color: '#0a0a0a', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'IM Fell English',Georgia,serif", fontSize: 15, fontWeight: 700, boxShadow: `0 4px 20px ${coverStyle.glow}`, transition: 'all 0.2s' }}>
                            {loading ? 'saving...' : step === 1 ? 'choose cover →' : 'create draft ✦'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Field({ label, type, value, onChange, placeholder, onEnter }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; onEnter?: () => void }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#6B6B6B', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onEnter?.()} placeholder={placeholder}
                style={{ width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, color: '#F5F2ED', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia,serif', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = `rgba(26,107,255,0.4)`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
        </div>
    )
}