import { useState } from 'react'
import type { ToolId, HandwritingFont } from '../../types'
import { HANDWRITING_FONTS, TOOL_COLORS } from '../../utils/constants'
import HandwritingModal from '../modals/HandwritingModal'

interface Props {
    activeTool: ToolId | null
    setActiveTool: (t: ToolId) => void
    toolColor: string
    setToolColor: (c: string) => void
    toolSize: number
    setToolSize: (s: number) => void
    activeFont: HandwritingFont
    setActiveFont: (f: HandwritingFont) => void
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    fileInputRef: React.RefObject<HTMLInputElement | null>
    accentColor: string
    customFont: HandwritingFont | null
    onFontGenerated: (fontData: string) => void
    onClearCustomFont: () => void
}

const TOOLS = [
    { id: 'pen' as ToolId, icon: '🖊', label: 'Ink Pen' },
    { id: 'pencil' as ToolId, icon: '✏', label: 'Pencil' },
    { id: 'highlighter' as ToolId, icon: '🖌', label: 'Highlighter' },
    { id: 'eraser' as ToolId, icon: '◻', label: 'Eraser' },
    { id: 'text' as ToolId, icon: 'T', label: 'Text' },
]

const DIM = 'rgba(237,232,223,0.45)'

export default function LeftPanel({
    activeTool, setActiveTool, toolColor, setToolColor, toolSize, setToolSize,
    activeFont, setActiveFont, onImageUpload, fileInputRef, accentColor,
    customFont, onFontGenerated, onClearCustomFont,
}: Props) {
    const [showHandwritingModal, setShowHandwritingModal] = useState(false)

    const handleFontGenerated = (fontData: string) => {
        onFontGenerated(fontData)
        if (customFont) setActiveFont(customFont)
    }

    return (
        <div style={{ width: 196, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
            <style>{`
                @keyframes lp-border-spin {
                    0%   { background-position: 0% 50% }
                    50%  { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                }
                @keyframes lp-glow-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
                @keyframes lp-shimmer    { 0%{background-position:200% center} 100%{background-position:-200% center} }
            `}</style>

            {/* Tools */}
            <Block title="Tools" accent={accentColor}>
                {TOOLS.map(t => (
                    <button key={t.id} onClick={() => setActiveTool(t.id)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: 'none', background: activeTool === t.id ? `${accentColor}18` : 'transparent', color: activeTool === t.id ? accentColor : DIM, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, transition: 'all 0.15s', outline: activeTool === t.id ? `1px solid ${accentColor}35` : '1px solid transparent', fontFamily: 'Georgia,serif' }}
                        onMouseEnter={e => { if (activeTool !== t.id) { e.currentTarget.style.color = '#F5F2ED'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
                        onMouseLeave={e => { if (activeTool !== t.id) { e.currentTarget.style.color = DIM; e.currentTarget.style.background = 'transparent' } }}>
                        <span style={{ fontSize: t.id === 'text' ? 15 : 17, fontWeight: t.id === 'text' ? 900 : 400, width: 20, textAlign: 'center' }}>{t.icon}</span>
                        <span style={{ fontSize: 12, letterSpacing: 0.3 }}>{t.label}</span>
                        {activeTool === t.id && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: accentColor, boxShadow: `0 0 5px ${accentColor}` }} />}
                    </button>
                ))}
            </Block>

            {/* Color */}
            <Block title="Color" accent={accentColor}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5, marginBottom: 8 }}>
                    {TOOL_COLORS.map(c => (
                        <div key={c} onClick={() => setToolColor(c)}
                            style={{ aspectRatio: '1', borderRadius: 6, background: c, cursor: 'pointer', border: toolColor === c ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent', boxShadow: toolColor === c ? `0 0 10px ${c}80` : '0 1px 3px rgba(0,0,0,0.5)', transition: 'all 0.12s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.18)'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'} />
                    ))}
                </div>
                <input type="color" value={toolColor} onChange={e => setToolColor(e.target.value)}
                    style={{ width: '100%', height: 32, border: `1px solid ${accentColor}25`, borderRadius: 7, background: 'rgba(255,255,255,0.04)', cursor: 'pointer', padding: 3 }} />
            </Block>

            {/* Size */}
            <Block title="Size" accent={accentColor}>
                <input type="range" min="1" max="24" value={toolSize} onChange={e => setToolSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor, marginBottom: 8 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: Math.min(toolSize * 1.4, 22), height: Math.min(toolSize * 1.4, 22), borderRadius: '50%', background: toolColor, boxShadow: `0 0 8px ${toolColor}60`, transition: 'all 0.2s', flexShrink: 0 }} />
                    <span style={{ color: accentColor, fontSize: 11, fontFamily: 'monospace' }}>{toolSize}px</span>
                </div>
            </Block>

            {/* ✦ MY FONT — golden standout block */}
            <div style={{ position: 'relative' }}>
                {/* Animated golden border */}
                <div style={{ position: 'absolute', inset: -1.5, borderRadius: 15, background: 'linear-gradient(135deg, rgba(212,175,55,0.8) 0%, rgba(255,220,100,0.3) 35%, rgba(139,110,30,0.5) 60%, rgba(212,175,55,0.8) 100%)', backgroundSize: '300% 300%', animation: 'lp-border-spin 4s ease infinite', zIndex: 0 }} />

                {/* Ambient glow */}
                <div style={{ position: 'absolute', inset: -8, borderRadius: 20, background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%)', animation: 'lp-glow-pulse 3s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(160deg, rgba(14,11,8,0.98) 0%, rgba(6,5,12,0.98) 100%)', borderRadius: 13, padding: 13 }}>
                    {/* Corner ornaments */}
                    <div style={{ position: 'absolute', top: 8, left: 8, width: 10, height: 10, borderTop: '1px solid rgba(212,175,55,0.4)', borderLeft: '1px solid rgba(212,175,55,0.4)', borderRadius: '2px 0 0 0' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderTop: '1px solid rgba(212,175,55,0.4)', borderRight: '1px solid rgba(212,175,55,0.4)', borderRadius: '0 2px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, width: 10, height: 10, borderBottom: '1px solid rgba(212,175,55,0.4)', borderLeft: '1px solid rgba(212,175,55,0.4)', borderRadius: '0 0 0 2px' }} />
                    <div style={{ position: 'absolute', bottom: 8, right: 8, width: 10, height: 10, borderBottom: '1px solid rgba(212,175,55,0.4)', borderRight: '1px solid rgba(212,175,55,0.4)', borderRadius: '0 0 2px 0' }} />

                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 9, color: 'rgba(212,175,55,0.9)', animation: 'lp-glow-pulse 2s ease-in-out infinite' }}>✦</span>
                            <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 700, background: 'linear-gradient(90deg, rgba(212,175,55,1), rgba(255,230,120,1), rgba(212,175,55,1))', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'lp-shimmer 3s linear infinite' }}>My Font</p>
                        </div>
                        {customFont && (
                            <button onClick={onClearCustomFont} title="Remove custom font"
                                style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.3)', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1, transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,80,80,0.8)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,80,80,0.3)'}>×</button>
                        )}
                    </div>

                    {/* Custom font button or placeholder text */}
                    {customFont ? (
                        <button onClick={() => setActiveFont(customFont)}
                            style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: `1px solid ${activeFont.id === customFont.id ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.1)'}`, background: activeFont.id === customFont.id ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.03)', color: activeFont.id === customFont.id ? 'rgba(212,175,55,1)' : 'rgba(212,175,55,0.55)', cursor: 'pointer', fontSize: 16, fontFamily: customFont.family, textAlign: 'left', transition: 'all 0.15s', marginBottom: 8, boxShadow: activeFont.id === customFont.id ? '0 0 14px rgba(212,175,55,0.2)' : 'none' }}
                            onMouseEnter={e => { if (activeFont.id !== customFont.id) { e.currentTarget.style.color = 'rgba(212,175,55,0.85)'; e.currentTarget.style.background = 'rgba(212,175,55,0.07)' } }}
                            onMouseLeave={e => { if (activeFont.id !== customFont.id) { e.currentTarget.style.color = 'rgba(212,175,55,0.55)'; e.currentTarget.style.background = 'rgba(212,175,55,0.03)' } }}>
                            My Handwriting
                        </button>
                    ) : (
                        <p style={{ margin: '0 0 10px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10, color: 'rgba(212,175,55,0.3)', lineHeight: 1.55 }}>
                            Turn your real handwriting into a font
                        </p>
                    )}

                    {/* CTA button */}
                    <button onClick={() => setShowHandwritingModal(true)}
                        style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(212,175,55,0.3)', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.04))', color: 'rgba(212,175,55,0.75)', cursor: 'pointer', fontSize: 9, letterSpacing: '0.25em', fontFamily: 'Georgia, serif', textAlign: 'center', outline: 'none', transition: 'all 0.2s', boxShadow: '0 0 14px rgba(212,175,55,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.08))'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.55)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(212,175,55,0.2)'; e.currentTarget.style.color = 'rgba(212,175,55,1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.04))'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(212,175,55,0.08)'; e.currentTarget.style.color = 'rgba(212,175,55,0.75)' }}>
                        {customFont ? '✦ regenerate' : '✦ create my font'}
                    </button>
                </div>
            </div>

            {/* Standard Handwriting Fonts */}
            <Block title="Handwriting" accent={accentColor}>
                {HANDWRITING_FONTS.map(f => (
                    <button key={f.id} onClick={() => setActiveFont(f)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: activeFont.id === f.id ? `${accentColor}15` : 'transparent', color: activeFont.id === f.id ? accentColor : DIM, cursor: 'pointer', fontSize: 15, fontFamily: f.family, textAlign: 'left', outline: activeFont.id === f.id ? `1px solid ${accentColor}30` : '1px solid transparent', transition: 'all 0.15s', marginBottom: 2 }}
                        onMouseEnter={e => { if (activeFont.id !== f.id) { e.currentTarget.style.color = '#F5F2ED'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
                        onMouseLeave={e => { if (activeFont.id !== f.id) { e.currentTarget.style.color = DIM; e.currentTarget.style.background = 'transparent' } }}>
                        {f.label}
                    </button>
                ))}
            </Block>

            {/* Photo upload */}
            <button onClick={() => fileInputRef.current?.click()}
                style={{ padding: '12px', borderRadius: 11, border: `1px dashed ${accentColor}25`, background: 'transparent', color: DIM, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}60`; e.currentTarget.style.color = accentColor; e.currentTarget.style.background = `${accentColor}06` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${accentColor}25`; e.currentTarget.style.color = DIM; e.currentTarget.style.background = 'transparent' }}>
                📷 Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} style={{ display: 'none' }} />

            {/* Handwriting modal */}
            {showHandwritingModal && (
                <HandwritingModal
                    accentColor={accentColor}
                    onClose={() => setShowHandwritingModal(false)}
                    onFontGenerated={handleFontGenerated}
                />
            )}
        </div>
    )
}

function Block({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 13, padding: 13, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: `${accent}60`, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Georgia,serif', fontWeight: 700 }}>{title}</p>
            {children}
        </div>
    )
}
