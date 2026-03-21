import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
    accentColor: string
    onClose: () => void
    onFontGenerated: (fontData: string) => void
}

type Step = 'template' | 'upload' | 'processing' | 'preview'

const G = (a: number) => `rgba(212,175,55,${a})`
const SERIF = "'Libre Baskerville', Georgia, serif"
const SANS = "'DM Sans', sans-serif"

const PIPELINE_STEPS = [
    { icon: '🖼', label: 'Preprocessing image' },
    { icon: '⊞', label: 'Detecting character grid' },
    { icon: '✂', label: 'Segmenting 62 glyphs' },
    { icon: '〜', label: 'Tracing vector paths' },
    { icon: 'Aa', label: 'Assembling OpenType font' },
]

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
const COLS = 6
const ROWS = Math.ceil(CHARS.length / COLS)
const TEMPLATE_W = 1920
const TEMPLATE_H = 3700

function Modal({ onClose, onFontGenerated }: Props) {
    const [step, setStep] = useState<Step>('template')
    const [dragOver, setDragOver] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [pipelineStep, setPipelineStep] = useState(-1)
    const [error, setError] = useState('')
    const [fontData, setFontData] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const downloadTemplate = () => {
        const canvas = document.createElement('canvas')
        canvas.width = TEMPLATE_W
        canvas.height = TEMPLATE_H
        const ctx = canvas.getContext('2d')!

        const MX = 80, MY = 180
        const CW = Math.floor((TEMPLATE_W - MX * 2) / COLS)
        const CH = Math.floor((TEMPLATE_H - MY - 60) / ROWS)

        ctx.fillStyle = '#FDFCF7'
        ctx.fillRect(0, 0, TEMPLATE_W, TEMPLATE_H)

        ctx.fillStyle = '#0e0c18'
        ctx.fillRect(0, 0, TEMPLATE_W, 120)
        ctx.fillStyle = '#fff'
        ctx.font = 'italic bold 44px Georgia'
        ctx.textAlign = 'center'
        ctx.fillText('drafts.  —  Handwriting Template', TEMPLATE_W / 2, 72)

        ctx.fillStyle = '#444'
        ctx.font = '24px Georgia'
        ctx.fillText('Write each character naturally inside its box. Use a dark pen. Scan or photograph clearly.', TEMPLATE_W / 2, 160)

        const sections = [
            { label: 'lowercase  a – z', startIdx: 0 },
            { label: 'UPPERCASE  A – Z', startIdx: 26 },
            { label: 'numbers  0 – 9', startIdx: 52 },
        ]

        CHARS.forEach((ch, i) => {
            const col = i % COLS
            const row = Math.floor(i / COLS)
            const x = MX + col * CW
            const y = MY + row * CH

            const sec = sections.find(s => s.startIdx === i)
            if (sec) {
                ctx.save()
                ctx.fillStyle = 'rgba(0,0,0,0.22)'
                ctx.font = 'bold 19px monospace'
                ctx.textAlign = 'left'
                ctx.textBaseline = 'bottom'
                ctx.fillText(sec.label, MX, y - 4)
                ctx.restore()
            }

            ctx.strokeStyle = '#c8c0b0'
            ctx.lineWidth = 1.5
            ctx.strokeRect(x + 6, y + 6, CW - 12, CH - 12)

            ctx.strokeStyle = 'rgba(180,160,120,0.35)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x + 20, y + CH * 0.72)
            ctx.lineTo(x + CW - 20, y + CH * 0.72)
            ctx.stroke()

            ctx.fillStyle = 'rgba(0,0,0,0.06)'
            ctx.font = `${CH * 0.52}px Georgia`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'alphabetic'
            ctx.fillText(ch, x + CW / 2, y + CH * 0.72)

            ctx.fillStyle = 'rgba(0,0,0,0.22)'
            ctx.font = 'bold 16px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText(ch, x + 14, y + 12)
        })

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob!)
            const a = document.createElement('a')
            a.href = url
            a.download = 'drafts-handwriting-template.png'
            a.click()
        })
    }

    const handleFile = (f: File) => {
        setFile(f); setPreviewUrl(URL.createObjectURL(f)); setError('')
    }

    const handleProcess = async () => {
        if (!file) return
        setStep('processing'); setProgress(0); setPipelineStep(0)
        PIPELINE_STEPS.forEach((_, i) => {
            setTimeout(() => {
                setPipelineStep(i)
                setProgress(Math.round((i + 1) / PIPELINE_STEPS.length * 90))
            }, i * 900)
        })
        try {
            const form = new FormData()
            form.append('sheet', file)
            const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://drafts-server.onrender.com').replace(/\/$/, '')}/api/font/generate`, { method: 'POST', body: form })
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            setFontData(data.fontData); setProgress(100)
            setPipelineStep(PIPELINE_STEPS.length)
            const existing = document.getElementById('my-handwriting-face')
            if (existing) existing.remove()
            const style = document.createElement('style')
            style.id = 'my-handwriting-face'
            style.textContent = `@font-face { font-family: 'MyHandwriting'; src: url('data:font/ttf;base64,${data.fontData}'); }`
            document.head.appendChild(style)
            setTimeout(() => setStep('preview'), 700)
        } catch (e: any) {
            setError(e.message || 'Processing failed. Try a clearer photo.')
            setStep('upload')
        }
    }

    const handleApply = () => {
        if (fontData) { onFontGenerated(fontData); onClose() }
    }

    const STEP_LABELS = ['Print', 'Upload', 'Process', 'Apply']
    const stepIdx = (['template', 'upload', 'processing', 'preview'] as Step[]).indexOf(step)

    const TITLE: Record<Step, string> = {
        template: 'Print the template',
        upload: 'Upload your sample',
        processing: 'Crafting your font…',
        preview: 'Your font is ready',
    }

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

            <style>{`
                @keyframes hm-in    { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes hm-spin  { to{transform:rotate(360deg)} }
                @keyframes hm-pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
                @keyframes hm-gold  { 0%,100%{box-shadow:0 0 40px rgba(212,175,55,0.12)} 50%{box-shadow:0 0 70px rgba(212,175,55,0.28)} }
                @keyframes hm-step  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
                @keyframes hm-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
                @keyframes hm-border{ 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
            `}</style>

            <div style={{ position: 'relative', animation: 'hm-in 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>

                <div style={{ position: 'absolute', inset: -2, borderRadius: 22, background: 'linear-gradient(135deg, rgba(212,175,55,0.85), rgba(255,220,100,0.35), rgba(139,110,30,0.55), rgba(255,220,100,0.35), rgba(212,175,55,0.85))', backgroundSize: '300% 300%', animation: 'hm-border 5s ease infinite', zIndex: 0 }} />

                <div style={{ position: 'absolute', inset: -16, borderRadius: 36, background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 68%)', animation: 'hm-gold 3s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, width: 520, background: 'linear-gradient(155deg, rgba(13,10,20,0.99) 0%, rgba(6,5,12,0.99) 55%, rgba(16,12,8,0.99) 100%)', borderRadius: 20, padding: '36px 40px 32px', maxHeight: '90vh', overflowY: 'auto' }}>

                    {[
                        { top: 14, left: 14, borderTop: true, borderLeft: true, borderRadius: '3px 0 0 0' },
                        { top: 14, right: 14, borderTop: true, borderRight: true, borderRadius: '0 3px 0 0' },
                        { bottom: 14, left: 14, borderBottom: true, borderLeft: true, borderRadius: '0 0 0 3px' },
                        { bottom: 14, right: 14, borderBottom: true, borderRight: true, borderRadius: '0 0 3px 0' },
                    ].map((c, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                            width: 14, height: 14,
                            borderTop: c.borderTop ? `1.5px solid ${G(0.45)}` : undefined,
                            borderBottom: c.borderBottom ? `1.5px solid ${G(0.45)}` : undefined,
                            borderLeft: c.borderLeft ? `1.5px solid ${G(0.45)}` : undefined,
                            borderRight: c.borderRight ? `1.5px solid ${G(0.45)}` : undefined,
                            borderRadius: c.borderRadius,
                        }} />
                    ))}

                    <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 320, height: 160, background: `radial-gradient(ellipse, ${G(0.07)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 20, border: `1px solid ${G(0.22)}`, background: G(0.06), marginBottom: 10 }}>
                                <span style={{ fontSize: 9, color: G(0.9) }}>✦</span>
                                <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.5em', fontFamily: SANS, textTransform: 'uppercase', background: `linear-gradient(90deg, ${G(1)}, rgba(255,230,120,1), ${G(1)})`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'hm-shine 3s linear infinite' }}>your handwriting font</p>
                                <span style={{ fontSize: 9, color: G(0.9) }}>✦</span>
                            </div>
                            <h2 style={{ margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: 'rgba(237,232,223,0.92)', letterSpacing: '-0.01em' }}>
                                {TITLE[step]}
                            </h2>
                        </div>

                        <button onClick={onClose}
                            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${G(0.2)}`, background: G(0.05), color: G(0.5), cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 16, transition: 'all 0.2s', outline: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.background = G(0.12); e.currentTarget.style.borderColor = G(0.5); e.currentTarget.style.color = G(0.9) }}
                            onMouseLeave={e => { e.currentTarget.style.background = G(0.05); e.currentTarget.style.borderColor = G(0.2); e.currentTarget.style.color = G(0.5) }}>
                            ×
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
                        {STEP_LABELS.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${i <= stepIdx ? G(0.8) : G(0.15)}`, background: i < stepIdx ? G(0.18) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i <= stepIdx ? G(1) : G(0.2), transition: 'all 0.3s', boxShadow: i === stepIdx ? `0 0 10px ${G(0.35)}` : 'none', fontFamily: SANS }}>
                                        {i < stepIdx ? '✓' : i + 1}
                                    </div>
                                    <span style={{ fontSize: 10, color: i === stepIdx ? G(0.85) : G(0.25), fontFamily: SANS, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{s}</span>
                                </div>
                                {i < 3 && <div style={{ flex: 1, height: 1, background: i < stepIdx ? `linear-gradient(90deg,${G(0.4)},${G(0.15)})` : G(0.08), margin: '0 8px' }} />}
                            </div>
                        ))}
                    </div>

                    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${G(0.35)}, transparent)`, marginBottom: 24 }} />

                    {step === 'template' && (
                        <div>
                            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: 'rgba(237,232,223,0.48)', lineHeight: 1.8, marginBottom: 20, margin: '0 0 20px' }}>
                                Download the sheet, print it, then fill each box with your natural handwriting using a{' '}
                                <strong style={{ color: G(0.9), fontStyle: 'normal' }}>dark pen</strong>.
                                Scan or photograph it flat and clear.
                            </p>

                            <div style={{ background: G(0.03), border: `1px solid ${G(0.1)}`, borderRadius: 10, padding: '14px 16px 10px', marginBottom: 20 }}>
                                {[
                                    { label: 'a – z', chars: CHARS.slice(0, 26) },
                                    { label: 'A – Z', chars: CHARS.slice(26, 52) },
                                    { label: '0 – 9', chars: CHARS.slice(52) },
                                ].map(section => (
                                    <div key={section.label} style={{ marginBottom: 10 }}>
                                        <p style={{ margin: '0 0 5px', fontSize: 8, color: G(0.35), letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: SANS }}>{section.label}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 3 }}>
                                            {section.chars.map(ch => (
                                                <div key={ch} style={{ aspectRatio: '1', border: `1px solid ${G(0.12)}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Georgia,serif', color: G(0.4) }}>
                                                    {ch}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <p style={{ margin: '6px 0 0', fontSize: 8, color: G(0.25), textAlign: 'center', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: SANS }}>62 glyphs — a–z · A–Z · 0–9</p>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={downloadTemplate}
                                    style={{ flex: 1, padding: '13px', borderRadius: 9, border: `1px solid ${G(0.4)}`, background: `linear-gradient(135deg, ${G(0.14)}, ${G(0.05)})`, color: G(1), cursor: 'pointer', fontSize: 11, letterSpacing: '0.25em', fontFamily: SANS, outline: 'none', transition: 'all 0.2s', boxShadow: `0 0 18px ${G(0.1)}` }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 32px ${G(0.28)}`; e.currentTarget.style.background = `linear-gradient(135deg,${G(0.22)},${G(0.1)})` }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 18px ${G(0.1)}`; e.currentTarget.style.background = `linear-gradient(135deg,${G(0.14)},${G(0.05)})` }}>
                                    ↓ download template
                                </button>
                                <button onClick={() => setStep('upload')}
                                    style={{ flex: 1, padding: '13px', borderRadius: 9, border: `1px solid ${G(0.1)}`, background: 'transparent', color: G(0.4), cursor: 'pointer', fontSize: 11, letterSpacing: '0.2em', fontFamily: SANS, outline: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = G(0.75); e.currentTarget.style.borderColor = G(0.28) }}
                                    onMouseLeave={e => { e.currentTarget.style.color = G(0.4); e.currentTarget.style.borderColor = G(0.1) }}>
                                    already have it →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'upload' && (
                        <div>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f) }}
                                onClick={() => fileRef.current?.click()}
                                style={{ border: `2px dashed ${dragOver ? G(1) : file ? G(0.45) : G(0.2)}`, borderRadius: 12, padding: file ? '14px' : '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: dragOver ? G(0.06) : 'transparent', marginBottom: 18, boxShadow: dragOver ? `0 0 28px ${G(0.15)}` : 'none' }}>
                                {file && previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 7, marginBottom: 8 }} />
                                        <p style={{ margin: 0, fontSize: 10, color: G(0.5), fontFamily: SANS }}>{file.name} · click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>📄</div>
                                        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: 'rgba(237,232,223,0.38)', margin: '0 0 5px' }}>Drop your filled template here</p>
                                        <p style={{ fontFamily: SANS, fontSize: 9, color: G(0.28), margin: 0, letterSpacing: '0.3em', textTransform: 'uppercase' }}>or click to browse</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} style={{ display: 'none' }} />
                            </div>

                            {error && <p style={{ color: 'rgba(255,100,100,0.75)', fontSize: 12, fontStyle: 'italic', margin: '0 0 14px', textAlign: 'center', fontFamily: SERIF }}>{error}</p>}

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => setStep('template')}
                                    style={{ padding: '12px 18px', borderRadius: 9, border: `1px solid ${G(0.1)}`, background: 'transparent', color: G(0.28), cursor: 'pointer', fontSize: 11, fontFamily: SANS, outline: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = G(0.6); e.currentTarget.style.borderColor = G(0.22) }}
                                    onMouseLeave={e => { e.currentTarget.style.color = G(0.28); e.currentTarget.style.borderColor = G(0.1) }}>← back</button>
                                <button onClick={handleProcess} disabled={!file}
                                    style={{ flex: 1, padding: '12px', borderRadius: 9, border: `1px solid ${file ? G(0.5) : G(0.1)}`, background: file ? `linear-gradient(135deg,${G(0.16)},${G(0.06)})` : 'transparent', color: file ? G(1) : G(0.18), cursor: file ? 'pointer' : 'not-allowed', fontSize: 11, letterSpacing: '0.25em', fontFamily: SANS, outline: 'none', transition: 'all 0.22s', boxShadow: file ? `0 0 20px ${G(0.15)}` : 'none' }}
                                    onMouseEnter={e => { if (file) { e.currentTarget.style.boxShadow = `0 0 38px ${G(0.3)}`; e.currentTarget.style.borderColor = G(0.7) } }}
                                    onMouseLeave={e => { if (file) { e.currentTarget.style.boxShadow = `0 0 20px ${G(0.15)}`; e.currentTarget.style.borderColor = G(0.5) } }}>
                                    ✦ generate my font
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div>
                            {/* cold start notice */}
                            <p style={{ margin: '0 0 20px', fontFamily: SERIF, fontStyle: 'italic', fontSize: 11, color: G(0.3), textAlign: 'center' }}>
                                first request may take ~30s to wake the server…
                            </p>

                            <div style={{ marginBottom: 24 }}>
                                {PIPELINE_STEPS.map((s, i) => (
                                    <div key={s.label}
                                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: `1px solid ${G(0.06)}`, animation: i <= pipelineStep ? `hm-step 0.35s ${i * 0.08}s both` : 'none', opacity: i <= pipelineStep ? 1 : 0.12, transition: 'opacity 0.3s' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${i < pipelineStep ? G(0.7) : i === pipelineStep ? G(0.5) : G(0.1)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < pipelineStep ? G(0.1) : 'transparent', flexShrink: 0, transition: 'all 0.3s', boxShadow: i === pipelineStep ? `0 0 14px ${G(0.25)}` : 'none', fontSize: 13 }}>
                                            {i < pipelineStep
                                                ? <span style={{ color: G(1) }}>✓</span>
                                                : i === pipelineStep
                                                    ? <span style={{ animation: 'hm-spin 1s linear infinite', display: 'inline-block', color: G(0.9) }}>◌</span>
                                                    : s.icon}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, color: i <= pipelineStep ? 'rgba(237,232,223,0.82)' : 'rgba(237,232,223,0.18)', letterSpacing: '0.03em', transition: 'color 0.3s' }}>{s.label}</p>
                                            {i === pipelineStep && <p style={{ margin: '2px 0 0', fontFamily: SERIF, fontStyle: 'italic', fontSize: 10, color: G(0.45), animation: 'hm-pulse 1.5s ease-in-out infinite' }}>working…</p>}
                                        </div>
                                        {i < pipelineStep && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: G(1), boxShadow: `0 0 8px ${G(1)}` }} />}
                                    </div>
                                ))}
                            </div>
                            <div style={{ height: 2, background: G(0.08), borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${G(0.6)},${G(1)},rgba(255,235,110,1))`, borderRadius: 2, transition: 'width 0.55s ease', boxShadow: `0 0 10px ${G(0.6)}` }} />
                            </div>
                            <p style={{ margin: '7px 0 0', fontFamily: 'monospace', fontSize: 10, color: G(0.38), textAlign: 'right' }}>{progress}%</p>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 24, border: `1px solid ${G(0.38)}`, background: G(0.08), boxShadow: `0 0 24px ${G(0.15)}` }}>
                                    <span style={{ color: G(1), fontSize: 11 }}>✦</span>
                                    <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: '0.4em', color: G(1), textTransform: 'uppercase' }}>font generated</span>
                                    <span style={{ color: G(1), fontSize: 11 }}>✦</span>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(253,252,247,0.96)', borderRadius: 10, padding: '20px 22px', marginBottom: 16, border: `1px solid ${G(0.18)}`, boxShadow: `0 0 28px ${G(0.1)}` }}>
                                <p style={{ margin: '0 0 3px', fontSize: 8, letterSpacing: '0.4em', color: 'rgba(0,0,0,0.28)', fontFamily: SANS, textTransform: 'uppercase' }}>preview</p>
                                <p style={{ margin: 0, fontFamily: "'MyHandwriting', Georgia, serif", fontSize: 28, color: '#1a1a2e', lineHeight: 1.5 }}>Hello World, this is my diary.</p>
                                <p style={{ margin: '6px 0 0', fontFamily: "'MyHandwriting', Georgia, serif", fontSize: 16, color: '#555', lineHeight: 1.6 }}>abcdefghijklmnopqrstuvwxyz</p>
                                <p style={{ margin: '2px 0 0', fontFamily: "'MyHandwriting', Georgia, serif", fontSize: 16, color: '#555', lineHeight: 1.6 }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                                <p style={{ margin: '2px 0 0', fontFamily: "'MyHandwriting', Georgia, serif", fontSize: 16, color: '#555', lineHeight: 1.6 }}>0123456789</p>
                            </div>

                            <div style={{ background: G(0.05), border: `1px solid ${G(0.15)}`, borderRadius: 9, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ color: G(0.7), fontSize: 13, marginTop: 1, flexShrink: 0 }}>✦</span>
                                <p style={{ margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 12, color: 'rgba(237,232,223,0.52)', lineHeight: 1.65 }}>
                                    62 unique glyphs — a–z, A–Z, and 0–9 — extracted from your handwriting and compiled into a real OpenType font, saved to this diary.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={onClose}
                                    style={{ padding: '12px 18px', borderRadius: 9, border: `1px solid ${G(0.1)}`, background: 'transparent', color: G(0.28), cursor: 'pointer', fontSize: 11, fontFamily: SANS, outline: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = G(0.6); e.currentTarget.style.borderColor = G(0.22) }}
                                    onMouseLeave={e => { e.currentTarget.style.color = G(0.28); e.currentTarget.style.borderColor = G(0.1) }}>discard</button>
                                <button onClick={handleApply}
                                    style={{ flex: 1, padding: '12px', borderRadius: 9, border: `1px solid ${G(0.5)}`, background: `linear-gradient(135deg,${G(0.18)},${G(0.07)})`, color: G(1), cursor: 'pointer', fontSize: 11, letterSpacing: '0.28em', fontFamily: SANS, outline: 'none', transition: 'all 0.22s', boxShadow: `0 0 24px ${G(0.18)}` }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 44px ${G(0.38)}`; e.currentTarget.style.background = `linear-gradient(135deg,${G(0.26)},${G(0.12)})` }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 24px ${G(0.18)}`; e.currentTarget.style.background = `linear-gradient(135deg,${G(0.18)},${G(0.07)})` }}>
                                    ✦ apply to diary
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function HandwritingModal(props: Props) {
    return createPortal(<Modal {...props} />, document.body)
}
