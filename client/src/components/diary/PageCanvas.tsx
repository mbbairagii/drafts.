import { useRef, useEffect, useState } from 'react'
import type { DiaryPage, ToolId, TextElement, StickerElement, ImageElement } from '../../types'
import { PAGE_THEMES } from '../../utils/constants'
import { generateId } from '../../utils/helpers'

interface Props {
    page: DiaryPage
    tool: ToolId
    toolColor: string
    toolSize: number
    fontFamily: string
    onUpdate: (page: DiaryPage) => void
}

interface Pos { x: number; y: number }

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

    useEffect(() => {
        setTexts(page.textElements || [])
        setStickers(page.stickers || [])
        setImages(page.images || [])
    }, [page._id])

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

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Pos => {
        const rect = canvas.getBoundingClientRect()
        const sx = canvas.width / rect.width
        const sy = canvas.height / rect.height
        if ('touches' in e) return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy }
        return { x: ((e as React.MouseEvent).clientX - rect.left) * sx, y: ((e as React.MouseEvent).clientY - rect.top) * sy }
    }

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!['pen', 'pencil', 'highlighter', 'eraser'].includes(tool)) return
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
        ctx.lineJoin = 'round'; ctx.lineCap = 'round'

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
        const canvas = canvasRef.current
        if (!canvas) return
        onUpdate({ ...page, drawingData: canvas.toDataURL(), textElements: texts, stickers, images })
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

    const updateText = (id: string, text: string) => {
        const updated = texts.map(t => t.id === id ? { ...t, text } : t)
        setTexts(updated)
        onUpdate({ ...page, textElements: updated, stickers, images })
    }

    const removeText = (id: string) => {
        const updated = texts.filter(t => t.id !== id)
        setTexts(updated)
        onUpdate({ ...page, textElements: updated, stickers, images })
    }

    const removeSticker = (id: string) => {
        const updated = stickers.filter(s => s.id !== id)
        setStickers(updated)
        onUpdate({ ...page, stickers: updated, textElements: texts, images })
    }

    const removeImage = (id: string) => {
        const updated = images.filter(i => i.id !== id)
        setImages(updated)
        onUpdate({ ...page, images: updated, textElements: texts, stickers })
    }

    return (
        <div
            style={{ position: 'relative', width: '100%', height: '100%', background: theme.bg, cursor: 'none', overflow: 'hidden' }}
            onClick={handleClick}
            onMouseDown={() => setSelectedId(null)}
        >
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
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }}
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
                    style={{ position: 'absolute', left: img.x, top: img.y, width: img.width, height: img.height, border: selectedId === img.id ? '2px dashed rgba(26,107,255,0.8)' : '2px solid transparent', borderRadius: 4, cursor: 'move' }}>
                    <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3, boxShadow: '2px 4px 16px rgba(0,0,0,0.3)' }} />
                    {selectedId === img.id && (
                        <button onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                            style={{ position: 'absolute', top: -10, right: -10, background: '#ff2244', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    )}
                </div>
            ))}

            {stickers.map(s => (
                <div key={s.id}
                    onDoubleClick={e => { e.stopPropagation(); removeSticker(s.id) }}
                    style={{ position: 'absolute', left: s.x, top: s.y, fontSize: s.size, cursor: 'grab', userSelect: 'none', transform: `rotate(${s.rotation}deg)`, filter: 'drop-shadow(1px 2px 5px rgba(0,0,0,0.2))', lineHeight: 1, transition: 'transform 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = `rotate(${s.rotation}deg) scale(1.15)`}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = `rotate(${s.rotation}deg) scale(1)`}>
                    {s.emoji}
                </div>
            ))}

            {texts.map(el => (
                <div key={el.id}
                    style={{ position: 'absolute', left: el.x, top: el.y, minWidth: 130 }}
                    onClick={e => e.stopPropagation()}>
                    {editingId === el.id
                        ? <textarea
                            autoFocus
                            defaultValue={el.text}
                            onChange={e => updateText(el.id, e.target.value)}
                            onBlur={() => { setEditingId(null); if (!el.text) removeText(el.id) }}
                            style={{ fontFamily: el.fontFamily, fontSize: el.fontSize, color: el.color, background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(26,107,255,0.5)', outline: 'none', resize: 'both', minWidth: 130, padding: '5px 7px', lineHeight: 1.5, borderRadius: 4, backdropFilter: 'blur(4px)', cursor: 'text' }} />
                        : <div
                            onClick={() => setEditingId(el.id)}
                            style={{ fontFamily: el.fontFamily, fontSize: el.fontSize, color: el.color, cursor: 'text', minWidth: 130, padding: '5px 7px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            {el.text || <span style={{ opacity: 0.25, fontSize: 12 }}>tap to write...</span>}
                        </div>
                    }
                </div>
            ))}
        </div>
    )
}