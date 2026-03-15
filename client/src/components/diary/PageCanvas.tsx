import { useRef, useEffect, useState } from 'react'
import type { DiaryPage, ToolId, TextElement, StickerElement, ImageElement } from '../../types'
import { PAGE_THEMES } from '../../utils/constants'
import { generateId } from '../../utils/helpers'

interface Props {
    page: DiaryPage
    tool: ToolId | null
    toolColor: string
    toolSize: number
    fontFamily: string
    onUpdate: (page: DiaryPage) => void
}

interface Pos { x: number; y: number }

// Isolated so React never re-renders the contentEditable mid-typing
function TextEditor({ el, onCommit, onRemove }: {
    el: TextElement
    onCommit: (id: string, text: string) => void
    onRemove: (id: string) => void
}) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        ref.current.innerText = el.text || ''
        // place caret at end
        const range = document.createRange()
        range.selectNodeContents(ref.current)
        range.collapse(false)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
        ref.current.focus()
    }, [])  // run once on mount only

    return (
        <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            dir="ltr"
            onInput={e => onCommit(el.id, (e.currentTarget as HTMLDivElement).innerText)}
            onBlur={e => {
                const text = (e.currentTarget as HTMLDivElement).innerText.trim()
                if (!text) onRemove(el.id)
                else onCommit(el.id, text)
            }}
            onKeyDown={e => {
                if (e.key === 'Escape') {
                    const text = (e.currentTarget as HTMLDivElement).innerText.trim()
                    if (!text) onRemove(el.id)
                    e.currentTarget.blur()
                }
            }}
            style={{
                fontFamily: el.fontFamily,
                fontSize: el.fontSize,
                color: el.color,
                outline: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'text',
                minWidth: 4,
                maxWidth: 380,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                caretColor: el.color,
                padding: 0,
                margin: 0,
                direction: 'ltr',
                unicodeBidi: 'plaintext',
                userSelect: 'text',
            }}
        />
    )
}

export default function PageCanvas({ page, tool, toolColor, toolSize, fontFamily, onUpdate }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawing = useRef(false)
    const lastPos = useRef<Pos | null>(null)

    const [texts, setTexts] = useState<TextElement[]>(page.textElements || [])
    const [stickers, setStickers] = useState<StickerElement[]>(page.stickers || [])
    const [images, setImages] = useState<ImageElement[]>(page.images || [])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const theme = PAGE_THEMES.find(t => t.id === page.theme) || PAGE_THEMES[0]

    const stickersRef = useRef(stickers)
    const textsRef = useRef(texts)
    const imagesRef = useRef(images)
    const pageRef = useRef(page)
    const onUpdateRef = useRef(onUpdate)

    useEffect(() => { stickersRef.current = stickers }, [stickers])
    useEffect(() => { textsRef.current = texts }, [texts])
    useEffect(() => { imagesRef.current = images }, [images])
    useEffect(() => { pageRef.current = page }, [page])
    useEffect(() => { onUpdateRef.current = onUpdate }, [onUpdate])

    const draggingSticker = useRef<{ id: string; ox: number; oy: number; startX: number; startY: number } | null>(null)
    const resizingSticker = useRef<{ id: string; startSize: number; startX: number; startY: number } | null>(null)
    const draggingImage = useRef<{ id: string; ox: number; oy: number; startX: number; startY: number } | null>(null)

    useEffect(() => {
        setTexts(page.textElements || [])
        setStickers(page.stickers || [])
        setImages(page.images || [])
    }, [page._id])

    useEffect(() => { setStickers(page.stickers || []) }, [page.stickers])
    useEffect(() => { setImages(page.images || []) }, [page.images])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (page.drawingData) {
            const img = new Image()
            img.onload = () => ctx.drawImage(img, 0, 0)
            img.src = page.drawingData
        }
    }, [page.drawingData, page._id])

    const flush = () => {
        onUpdateRef.current({
            ...pageRef.current,
            drawingData: canvasRef.current?.toDataURL() ?? null,
            stickers: stickersRef.current,
            images: imagesRef.current,
            textElements: textsRef.current,
        })
    }

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (draggingSticker.current) {
                const dx = e.clientX - draggingSticker.current.startX
                const dy = e.clientY - draggingSticker.current.startY
                setStickers(prev => prev.map(s =>
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
                setStickers(prev => prev.map(s =>
                    s.id === resizingSticker.current!.id ? { ...s, size: newSize } : s
                ))
            }
            if (draggingImage.current) {
                const dx = e.clientX - draggingImage.current.startX
                const dy = e.clientY - draggingImage.current.startY
                setImages(prev => prev.map(im =>
                    im.id === draggingImage.current!.id
                        ? { ...im, x: draggingImage.current!.ox + dx, y: draggingImage.current!.oy + dy }
                        : im
                ))
            }
        }
        const onUp = () => {
            if (draggingSticker.current || resizingSticker.current || draggingImage.current) {
                draggingSticker.current = null
                resizingSticker.current = null
                draggingImage.current = null
                flush()
            }
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Pos => {
        const rect = canvas.getBoundingClientRect()
        const sx = canvas.width / rect.width
        const sy = canvas.height / rect.height
        if ('touches' in e) return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy }
        return { x: ((e as React.MouseEvent).clientX - rect.left) * sx, y: ((e as React.MouseEvent).clientY - rect.top) * sy }
    }

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!tool || !['pen', 'pencil', 'highlighter', 'eraser'].includes(tool)) return
        const canvas = canvasRef.current
        if (!canvas) return
        drawing.current = true
        lastPos.current = getPos(e, canvas)
        e.preventDefault()
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!drawing.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const pos = getPos(e, canvas)
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.lineWidth = toolSize * 3
            ctx.strokeStyle = 'rgba(0,0,0,1)'
            ctx.globalAlpha = 1
        } else if (tool === 'highlighter') {
            ctx.globalCompositeOperation = 'multiply'
            ctx.lineWidth = toolSize * 5
            ctx.strokeStyle = toolColor
            ctx.globalAlpha = 0.3
        } else if (tool === 'pencil') {
            ctx.globalCompositeOperation = 'source-over'
            ctx.lineWidth = Math.max(0.5, toolSize * 0.6)
            ctx.strokeStyle = toolColor
            ctx.globalAlpha = 0.6 + Math.random() * 0.25
        } else {
            ctx.globalCompositeOperation = 'source-over'
            ctx.lineWidth = toolSize
            ctx.strokeStyle = toolColor
            ctx.globalAlpha = 1
        }

        ctx.beginPath()
        if (lastPos.current) ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        lastPos.current = pos
        e.preventDefault()
    }

    const endDraw = () => {
        if (!drawing.current) return
        drawing.current = false
        flush()
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (tool !== 'text') return
        const rect = e.currentTarget.getBoundingClientRect()
        const newEl: TextElement = {
            id: generateId(),
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            text: '',
            fontSize: 18,
            fontFamily,
            color: toolColor,
        }
        const updated = [...texts, newEl]
        setTexts(updated)
        onUpdate({ ...page, textElements: updated, stickers, images })
        setEditingId(newEl.id)
    }

    const commitText = (id: string, text: string) => {
        const updated = texts.map(t => t.id === id ? { ...t, text } : t)
        setTexts(updated)
        onUpdate({ ...page, textElements: updated, stickers, images })
    }

    const removeText = (id: string) => {
        const updated = texts.filter(t => t.id !== id)
        setTexts(updated)
        onUpdate({ ...page, textElements: updated, stickers, images })
        setEditingId(null)
    }

    const removeSticker = (id: string) => {
        const updated = stickers.filter(s => s.id !== id)
        setStickers(updated)
        onUpdate({ ...page, stickers: updated, textElements: texts, images })
        setSelectedId(null)
    }

    const removeImage = (id: string) => {
        const updated = images.filter(i => i.id !== id)
        setImages(updated)
        onUpdate({ ...page, images: updated, textElements: texts, stickers })
        setSelectedId(null)
    }

    return (
        <div
            style={{ position: 'relative', width: '100%', height: '100%', background: theme.bg, cursor: 'none', overflow: 'hidden', isolation: 'isolate' }}
            onClick={e => { if (tool !== 'text') setSelectedId(null); handleClick(e) }}
        >
            <style>{`
                [contenteditable]:focus { outline: none !important; }
                [contenteditable]::selection { background: rgba(26,107,255,0.15); }
            `}</style>

            {theme.pattern === 'lined' && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}>
                    {Array.from({ length: 26 }).map((_, i) => (
                        <line key={i} x1="0" y1={32 + i * 27} x2="100%" y2={32 + i * 27} stroke={theme.lineColor} strokeWidth="0.8" />
                    ))}
                    <line x1="68" y1="0" x2="68" y2="100%" stroke="#ff6b6b" strokeWidth="1" opacity="0.25" />
                </svg>
            )}
            {theme.pattern === 'grid' && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.3 }}>
                    <defs>
                        <pattern id={`g${page._id}`} width="22" height="22" patternUnits="userSpaceOnUse">
                            <path d="M 22 0 L 0 0 0 22" fill="none" stroke={theme.lineColor} strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#g${page._id})`} />
                </svg>
            )}
            {theme.pattern === 'dot' && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.45 }}>
                    <defs>
                        <pattern id={`d${page._id}`} width="22" height="22" patternUnits="userSpaceOnUse">
                            <circle cx="11" cy="11" r="1.1" fill={theme.lineColor} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#d${page._id})`} />
                </svg>
            )}

            <canvas
                ref={canvasRef}
                width={500}
                height={700}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', willChange: 'contents' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
            />

            {images.map(img => (
                <div key={img.id}
                    onClick={e => { e.stopPropagation(); setSelectedId(img.id) }}
                    onMouseDown={e => {
                        e.stopPropagation()
                        setSelectedId(img.id)
                        draggingImage.current = { id: img.id, ox: img.x, oy: img.y, startX: e.clientX, startY: e.clientY }
                    }}
                    style={{ position: 'absolute', left: img.x, top: img.y, width: img.width, height: img.height, border: selectedId === img.id ? '2px dashed rgba(26,107,255,0.7)' : '2px solid transparent', borderRadius: 4, cursor: 'move', userSelect: 'none' }}>
                    <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3, boxShadow: '2px 4px 16px rgba(0,0,0,0.3)', pointerEvents: 'none' }} draggable={false} />
                    {selectedId === img.id && (
                        <button onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                            style={{ position: 'absolute', top: -10, right: -10, background: '#ff2244', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
                    )}
                </div>
            ))}

            {stickers.map(s => (
                <div key={s.id}
                    onClick={e => { e.stopPropagation(); setSelectedId(s.id) }}
                    onMouseDown={e => {
                        e.stopPropagation()
                        setSelectedId(s.id)
                        draggingSticker.current = { id: s.id, ox: s.x, oy: s.y, startX: e.clientX, startY: e.clientY }
                    }}
                    style={{ position: 'absolute', left: s.x, top: s.y, width: s.size, height: s.size, transform: `rotate(${s.rotation}deg)`, cursor: 'grab', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: selectedId === s.id ? 'drop-shadow(0 0 6px rgba(26,107,255,0.6))' : 'drop-shadow(1px 2px 5px rgba(0,0,0,0.2))', outline: selectedId === s.id ? '1.5px dashed rgba(26,107,255,0.55)' : 'none', borderRadius: 4, transition: 'filter 0.15s, outline 0.15s' }}
                    onMouseEnter={e => { if (selectedId !== s.id) e.currentTarget.style.transform = `rotate(${s.rotation}deg) scale(1.08)` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${s.rotation}deg) scale(1)` }}
                >
                    {s.src
                        ? <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} draggable={false} />
                        : <span style={{ fontSize: s.size * 0.75, lineHeight: 1, pointerEvents: 'none' }}>{s.emoji}</span>
                    }
                    {selectedId === s.id && (
                        <>
                            <button onClick={e => { e.stopPropagation(); removeSticker(s.id) }}
                                style={{ position: 'absolute', top: -10, right: -10, background: '#ff2244', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
                            <div
                                onMouseDown={e => {
                                    e.stopPropagation()
                                    resizingSticker.current = { id: s.id, startSize: s.size, startX: e.clientX, startY: e.clientY }
                                }}
                                style={{ position: 'absolute', bottom: -7, right: -7, width: 14, height: 14, borderRadius: '50%', background: '#1a6bff', border: '2px solid rgba(255,255,255,0.5)', cursor: 'se-resize', zIndex: 2 }}
                            />
                        </>
                    )}
                </div>
            ))}

            {texts.map(el => (
                <div key={el.id}
                    style={{ position: 'absolute', left: el.x, top: el.y }}
                    onClick={e => e.stopPropagation()}>
                    {editingId === el.id
                        ? <TextEditor
                            el={el}
                            onCommit={commitText}
                            onRemove={id => { removeText(id); setEditingId(null) }}
                        />
                        : <div
                            onClick={() => setEditingId(el.id)}
                            style={{
                                fontFamily: el.fontFamily,
                                fontSize: el.fontSize,
                                color: el.color,
                                cursor: 'text',
                                maxWidth: 380,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                direction: 'ltr',
                                padding: 0,
                                margin: 0,
                                minWidth: 4,
                                minHeight: el.fontSize,
                                userSelect: 'none',
                            }}>
                            {el.text || <span style={{ opacity: 0.2, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>write here…</span>}
                        </div>
                    }
                </div>
            ))}
        </div>
    )
}
