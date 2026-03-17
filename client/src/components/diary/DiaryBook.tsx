import { useState, useEffect, useRef } from 'react'
import type { Diary, DiaryPage, ToolId, StickerElement } from '../../types'
import { COVER_STYLES } from '../../utils/constants'
import PageCanvas from './PageCanvas'

interface Props {
    diary: Diary
    page: DiaryPage | null
    currentPage: number
    totalPages: number
    tool: ToolId | null
    toolColor: string
    toolSize: number
    fontFamily: string
    flipAnim: 'next' | 'prev' | null
    onUpdatePage: (p: DiaryPage) => void
    onUpdateCoverStickers: (stickers: StickerElement[]) => void
    onFlip: (dir: 'next' | 'prev') => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export default function DiaryBook({
    diary, page, currentPage, totalPages,
    tool, toolColor, toolSize, fontFamily,
    flipAnim, onUpdatePage, onUpdateCoverStickers, onFlip,
    isOpen, onOpen, onClose,
}: Props) {
    const cover = COVER_STYLES.find(c => c.id === diary.cover) || COVER_STYLES[0]
    const canPrev = currentPage > 0
    const canNext = currentPage < totalPages - 1
    const leafClass = flipAnim === 'next' ? 'flip-leaf-next' : flipAnim === 'prev' ? 'flip-leaf-prev' : ''

    const [isFlipping, setIsFlipping] = useState(false)
    const [revealDone, setRevealDone] = useState(false)
    const [coverStickers, setCoverStickers] = useState<StickerElement[]>(diary.coverStickers || [])
    const [selectedCoverSticker, setSelectedCoverSticker] = useState<string | null>(null)

    const draggingSticker = useRef<{ id: string; ox: number; oy: number; startX: number; startY: number } | null>(null)
    const resizingSticker = useRef<{ id: string; startSize: number; startX: number; startY: number } | null>(null)
    const coverStickersRef = useRef(coverStickers)
    const onUpdateRef = useRef(onUpdateCoverStickers)

    useEffect(() => { coverStickersRef.current = coverStickers }, [coverStickers])
    useEffect(() => { onUpdateRef.current = onUpdateCoverStickers }, [onUpdateCoverStickers])
    useEffect(() => { setCoverStickers(diary.coverStickers || []) }, [diary.coverStickers])
    useEffect(() => { if (!isOpen) setRevealDone(false) }, [isOpen])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (draggingSticker.current) {
                const dx = e.clientX - draggingSticker.current.startX
                const dy = e.clientY - draggingSticker.current.startY
                setCoverStickers(prev => prev.map(s =>
                    s.id === draggingSticker.current!.id
                        ? { ...s, x: draggingSticker.current!.ox + dx, y: draggingSticker.current!.oy + dy }
                        : s
                ))
            }
            if (resizingSticker.current) {
                const dx = e.clientX - resizingSticker.current.startX
                const dy = e.clientY - resizingSticker.current.startY
                const delta = Math.sqrt(dx * dx + dy * dy) * (dx + dy > 0 ? 1 : -1)
                const newSize = Math.max(24, resizingSticker.current.startSize + delta)
                setCoverStickers(prev => prev.map(s =>
                    s.id === resizingSticker.current!.id ? { ...s, size: newSize } : s
                ))
            }
        }
        const onUp = () => {
            if (draggingSticker.current || resizingSticker.current) {
                draggingSticker.current = null
                resizingSticker.current = null
                onUpdateRef.current(coverStickersRef.current)
            }
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    const handleOpenClick = () => {
        if (isFlipping || isOpen) return
        setIsFlipping(true)
        setTimeout(() => { onOpen(); setIsFlipping(false) }, 780)
    }

    const removeCoverSticker = (sid: string) => {
        const updated = coverStickers.filter(s => s.id !== sid)
        setCoverStickers(updated)
        onUpdateCoverStickers(updated)
        setSelectedCoverSticker(null)
    }

    const pageCount = Math.min(totalPages, 8)
    const stackDepth = Math.min(totalPages - 1, 5)

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400&display=swap');

                @keyframes db-cover-flip {
                    0%   { transform: rotateY(0deg);    box-shadow:  16px 20px 70px rgba(0,0,0,0.8); }
                    40%  {                               box-shadow:  40px 30px 90px rgba(0,0,0,0.9); }
                    100% { transform: rotateY(-186deg); box-shadow: -10px 20px 50px rgba(0,0,0,0.5); }
                }
                @keyframes db-cover-shine {
                    0%,100% { opacity: 0; }
                    50%     { opacity: 0.35; }
                }
                @keyframes db-open-hint {
                    0%,100% { opacity: 0.5; transform: translateY(0); }
                    50%     { opacity: 1;   transform: translateY(-3px); }
                }
                @keyframes db-title-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes db-line-expand {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
                @keyframes db-page-reveal-kf {
                    0%   { opacity: 0; transform: perspective(1300px) rotateY(-18deg); }
                    100% { opacity: 1; transform: perspective(1300px) rotateY(0deg); }
                }
                .db-page-reveal {
                    animation: db-page-reveal-kf 0.55s cubic-bezier(0.22,1,0.36,1) both;
                    transform-origin: left center;
                }
                @keyframes flip-leaf-next-kf {
                    0%   { transform: perspective(1400px) rotateY(0deg);   opacity: 1; }
                    30%  { transform: perspective(1400px) rotateY(-22deg) scaleX(0.97); opacity: 1; }
                    62%  { transform: perspective(1400px) rotateY(-22deg) scaleX(0.97); opacity: 1; }
                    88%  { transform: perspective(1400px) rotateY(-3deg);  opacity: 0.6; }
                    100% { transform: perspective(1400px) rotateY(0deg);   opacity: 0; }
                }
                .flip-leaf-next {
                    animation: flip-leaf-next-kf 0.5s cubic-bezier(0.4,0,0.2,1) both;
                    transform-origin: left center;
                }
                @keyframes flip-leaf-prev-kf {
                    0%   { transform: perspective(1400px) rotateY(0deg);   opacity: 1; }
                    30%  { transform: perspective(1400px) rotateY(18deg) scaleX(0.97); opacity: 1; }
                    62%  { transform: perspective(1400px) rotateY(18deg) scaleX(0.97); opacity: 1; }
                    88%  { transform: perspective(1400px) rotateY(3deg);   opacity: 0.6; }
                    100% { transform: perspective(1400px) rotateY(0deg);   opacity: 0; }
                }
                .flip-leaf-prev {
                    animation: flip-leaf-prev-kf 0.5s cubic-bezier(0.4,0,0.2,1) both;
                    transform-origin: left center;
                }
                @keyframes db-fadein {
                    from { opacity: 0; transform: translateY(5px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .db-dots-in { animation: db-fadein 0.4s 0.3s cubic-bezier(0.2,1,0.3,1) both; }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => setSelectedCoverSticker(null)}>

                <div style={{ position: 'relative' }}>

                    {isOpen && (
                        <button
                            onClick={() => canPrev && onFlip('prev')} disabled={!canPrev}
                            style={{ position: 'absolute', left: -54, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 42, height: 42, borderRadius: '50%', border: `1px solid ${canPrev ? cover.accent + '60' : 'rgba(255,255,255,0.04)'}`, background: canPrev ? `${cover.accent}12` : 'transparent', color: canPrev ? cover.accent : 'rgba(255,255,255,0.08)', cursor: canPrev ? 'pointer' : 'default', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', outline: 'none' }}
                            onMouseEnter={e => { if (canPrev) e.currentTarget.style.background = `${cover.accent}22` }}
                            onMouseLeave={e => { if (canPrev) e.currentTarget.style.background = `${cover.accent}12` }}
                        >‹</button>
                    )}

                    <div style={{ width: 520, height: 700, borderRadius: '3px 16px 16px 3px', position: 'relative', boxShadow: `16px 20px 70px rgba(0,0,0,0.8), -2px 0 24px rgba(0,0,0,0.5), 0 0 50px ${cover.glow}`, perspective: '1400px' }}>

                        {/* Spine */}
                        <div style={{ position: 'absolute', left: 0, top: 0, width: 26, height: '100%', backgroundColor: cover.bg, zIndex: 5, borderRadius: '3px 0 0 3px', boxShadow: 'inset -4px 0 10px rgba(0,0,0,0.5), 3px 0 10px rgba(0,0,0,0.3)' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.04) 0px,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 7px)', borderRadius: 'inherit' }} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-90deg)', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.1)', fontSize: 7, letterSpacing: 3, fontFamily: 'Georgia,serif', textTransform: 'uppercase' }}>{diary.name}</div>
                        </div>

                        {/* Page stack */}
                        {Array.from({ length: stackDepth }).map((_, i) => (
                            <div key={i} style={{ position: 'absolute', right: -(i + 1) * 1.5, top: 2 + i * 0.6, bottom: 2 + i * 0.6, width: 4, borderRadius: '0 2px 2px 0', backgroundColor: `rgba(245,240,232,${0.55 - i * 0.08})`, zIndex: 3 - i, boxShadow: '1px 0 3px rgba(0,0,0,0.15)' }} />
                        ))}

                        {/* Closed cover */}
                        {!isOpen && (
                            <div
                                onClick={e => { if ((e.target as HTMLElement).closest('[data-sticker]')) return; handleOpenClick() }}
                                style={{
                                    position: 'absolute', left: 26, top: 0, right: 0, bottom: 0,
                                    backgroundColor: cover.bg,           // ← was `background: cover.bg` — caused the conflict
                                    backgroundImage: `url(${cover.bgImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '0 16px 16px 0', overflow: 'hidden', cursor: 'pointer',
                                    transformOrigin: 'left center',
                                    animation: isFlipping ? 'db-cover-flip 0.78s cubic-bezier(0.4,0,0.2,1) both' : 'none',
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(0,0,0,0.025) 0px,rgba(0,0,0,0.025) 1px,transparent 1px,transparent 15px)', pointerEvents: 'none', zIndex: 1 }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.12) 0%,rgba(0,0,0,0.35) 42%,rgba(0,0,0,0.55) 100%)', pointerEvents: 'none', zIndex: 2 }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.07) 50%,transparent 70%)', animation: isFlipping ? 'db-cover-shine 0.78s ease' : 'none', pointerEvents: 'none', zIndex: 3 }} />
                                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to left,rgba(0,0,0,0.4),transparent)', pointerEvents: 'none', zIndex: 3 }} />
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 28, background: 'linear-gradient(to right,rgba(0,0,0,0.22),transparent)', pointerEvents: 'none', zIndex: 3 }} />

                                <div style={{ position: 'absolute', right: -5, top: '18%', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
                                    {Array.from({ length: pageCount }).map((_, i) => (
                                        <div key={i} style={{ width: 12, height: 9, borderRadius: '0 3px 3px 0', backgroundColor: i === currentPage % 8 ? cover.accent : 'rgba(255,255,255,0.05)', boxShadow: i === currentPage % 8 ? `0 0 7px ${cover.glow}` : 'none', transition: 'all 0.3s' }} />
                                    ))}
                                </div>

                                {/* Cover stickers */}
                                {coverStickers.map(s => (
                                    <div
                                        key={s.id}
                                        data-sticker="true"
                                        onClick={e => { e.stopPropagation(); setSelectedCoverSticker(s.id) }}
                                        onMouseDown={e => {
                                            e.stopPropagation()
                                            setSelectedCoverSticker(s.id)
                                            draggingSticker.current = { id: s.id, ox: s.x, oy: s.y, startX: e.clientX, startY: e.clientY }
                                        }}
                                        style={{ position: 'absolute', left: s.x, top: s.y, width: s.size, height: s.size, transform: `rotate(${s.rotation}deg)`, cursor: 'grab', userSelect: 'none', zIndex: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: selectedCoverSticker === s.id ? '1.5px dashed rgba(255,255,255,0.5)' : 'none', borderRadius: 4, filter: 'drop-shadow(1px 2px 6px rgba(0,0,0,0.55))' }}
                                    >
                                        {s.src
                                            ? <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} draggable={false} />
                                            : <span style={{ fontSize: s.size * 0.75, lineHeight: 1, pointerEvents: 'none' }}>{s.emoji}</span>
                                        }
                                        {selectedCoverSticker === s.id && (
                                            <>
                                                <button onClick={e => { e.stopPropagation(); removeCoverSticker(s.id) }}
                                                    style={{ position: 'absolute', top: -10, right: -10, backgroundColor: '#ff2244', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11 }}>×</button>
                                                <div
                                                    onMouseDown={e => {
                                                        e.stopPropagation()
                                                        resizingSticker.current = { id: s.id, startSize: s.size, startX: e.clientX, startY: e.clientY }
                                                    }}
                                                    style={{ position: 'absolute', bottom: -7, right: -7, width: 14, height: 14, borderRadius: '50%', backgroundColor: cover.accent, border: '2px solid rgba(0,0,0,0.4)', cursor: 'se-resize', zIndex: 11 }}
                                                />
                                            </>
                                        )}
                                    </div>
                                ))}

                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 44px', zIndex: 5 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, animation: 'db-line-expand 0.7s 0.1s both' }}>
                                        <div style={{ height: 1, width: 48, background: 'linear-gradient(to left,rgba(255,255,255,0.22),transparent)' }} />
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', boxShadow: `0 0 8px ${cover.accent}` }} />
                                        <div style={{ height: 1, width: 48, background: 'linear-gradient(to right,rgba(255,255,255,0.22),transparent)' }} />
                                    </div>
                                    <h2 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontStyle: 'italic', fontSize: 34, color: '#fff', textAlign: 'center', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', textShadow: `0 2px 20px rgba(0,0,0,0.95),0 0 48px ${cover.accent}50`, animation: 'db-title-in 0.7s 0.2s both' }}>
                                        {diary.name}
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, animation: 'db-line-expand 0.7s 0.3s both' }}>
                                        <div style={{ height: 1, width: 48, background: 'linear-gradient(to left,rgba(255,255,255,0.22),transparent)' }} />
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', boxShadow: `0 0 8px ${cover.accent}` }} />
                                        <div style={{ height: 1, width: 48, background: 'linear-gradient(to right,rgba(255,255,255,0.22),transparent)' }} />
                                    </div>
                                    {diary.passwordHash && (
                                        <div style={{ marginTop: 24, padding: '4px 14px', border: `1px solid ${cover.accent}45`, borderRadius: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>locked</div>
                                    )}
                                    {!isFlipping && (
                                        <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6, pointerEvents: 'none' }}>
                                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5em', textTransform: 'uppercase', animation: 'db-open-hint 2.4s ease-in-out infinite' }}>tap to open</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Open page */}
                        {isOpen && (
                            <>
                                <div style={{ position: 'absolute', left: 26, top: 0, right: 0, bottom: 0, borderRadius: '0 16px 16px 0', overflow: 'hidden' }}>
                                    <div className={!revealDone ? 'db-page-reveal' : ''} onAnimationEnd={() => setRevealDone(true)} style={{ width: '100%', height: '100%' }}>
                                        {page
                                            ? <PageCanvas page={page} tool={tool} toolColor={toolColor} toolSize={toolSize} fontFamily={fontFamily} onUpdate={onUpdatePage} />
                                            : <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#ccc', fontFamily: 'Georgia,serif' }}>loading…</p></div>
                                        }
                                    </div>
                                </div>

                                {leafClass && (
                                    <div className={leafClass} style={{ position: 'absolute', left: 26, top: 0, right: 0, bottom: 0, borderRadius: '0 16px 16px 0', pointerEvents: 'none', zIndex: 7, background: 'linear-gradient(to right,#f0ebe0 0%,#f7f3eb 60%,#ede8de 100%)', boxShadow: leafClass === 'flip-leaf-next' ? 'inset -12px 0 28px rgba(0,0,0,0.12),inset 4px 0 12px rgba(0,0,0,0.06)' : 'inset 12px 0 28px rgba(0,0,0,0.12),inset -4px 0 12px rgba(0,0,0,0.06)' }} />
                                )}

                                <div style={{ position: 'absolute', top: 0, left: 26, right: 0, height: '100%', background: 'linear-gradient(to right,rgba(0,0,0,0.11) 0%,rgba(0,0,0,0.03) 5%,transparent 11%)', pointerEvents: 'none', zIndex: 4 }} />
                                <div style={{ position: 'absolute', top: 0, right: 0, width: 2, height: '100%', background: `linear-gradient(to bottom,transparent,${cover.accent}25,${cover.accent}15,transparent)`, borderRadius: '0 16px 16px 0', pointerEvents: 'none', zIndex: 6 }} />

                                <div style={{ position: 'absolute', top: 14, left: 38, right: 18, color: 'rgba(160,140,100,0.28)', fontSize: 10, fontFamily: 'Georgia,serif', zIndex: 10, textAlign: 'right', letterSpacing: 0.5, userSelect: 'none', pointerEvents: 'none' }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                                <div style={{ position: 'absolute', bottom: 14, right: 18, color: 'rgba(160,140,100,0.35)', fontSize: 11, fontFamily: 'Georgia,serif', zIndex: 10, userSelect: 'none', pointerEvents: 'none' }}>
                                    {currentPage + 1} / {totalPages}
                                </div>

                                <div style={{ position: 'absolute', right: -5, top: '18%', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
                                    {Array.from({ length: pageCount }).map((_, i) => (
                                        <div key={i} style={{ width: 12, height: 9, borderRadius: '0 3px 3px 0', backgroundColor: i === currentPage % 8 ? cover.accent : 'rgba(255,255,255,0.05)', boxShadow: i === currentPage % 8 ? `0 0 7px ${cover.glow}` : 'none', transition: 'all 0.3s' }} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {isOpen && (
                        <button
                            onClick={() => canNext && onFlip('next')} disabled={!canNext}
                            style={{ position: 'absolute', right: -54, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 42, height: 42, borderRadius: '50%', border: `1px solid ${canNext ? cover.accent + '60' : 'rgba(255,255,255,0.04)'}`, background: canNext ? `${cover.accent}12` : 'transparent', color: canNext ? cover.accent : 'rgba(255,255,255,0.08)', cursor: canNext ? 'pointer' : 'default', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', outline: 'none' }}
                            onMouseEnter={e => { if (canNext) e.currentTarget.style.background = `${cover.accent}22` }}
                            onMouseLeave={e => { if (canNext) e.currentTarget.style.background = `${cover.accent}12` }}
                        >›</button>
                    )}
                </div>

                {/* Footer */}
                <div style={{ height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                    <div className={isOpen ? 'db-dots-in' : ''} style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <div key={i} onClick={() => onFlip(i > currentPage ? 'next' : 'prev')}
                                style={{ width: i === currentPage ? 22 : 6, height: 6, borderRadius: 3, backgroundColor: i === currentPage ? cover.accent : 'rgba(255,255,255,0.08)', boxShadow: i === currentPage ? `0 0 8px ${cover.glow}` : 'none', transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer' }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={isOpen ? onClose : handleOpenClick}
                        disabled={isFlipping}
                        style={{ padding: '9px 28px', border: `1px solid ${cover.accent}45`, background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: isFlipping ? 'not-allowed' : 'pointer', fontSize: 9, fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.52em', textTransform: 'uppercase', borderRadius: 2, transition: 'all 0.3s', outline: 'none', opacity: isFlipping ? 0.4 : 1 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = cover.accent; e.currentTarget.style.color = cover.accent; e.currentTarget.style.boxShadow = `0 0 20px ${cover.accent}20` }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${cover.accent}45`; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                        {isOpen ? 'close diary' : 'open diary'}
                    </button>
                </div>
            </div>
        </>
    )
}
