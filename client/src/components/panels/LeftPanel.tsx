import type { ToolId, HandwritingFont } from '../../types'
import { HANDWRITING_FONTS, TOOL_COLORS } from '../../utils/constants'

interface Props {
    activeTool: ToolId
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
}

const TOOLS = [
    { id: 'pen' as ToolId, icon: '🖊', label: 'Ink Pen' },
    { id: 'pencil' as ToolId, icon: '✏', label: 'Pencil' },
    { id: 'highlighter' as ToolId, icon: '🖌', label: 'Highlighter' },
    { id: 'eraser' as ToolId, icon: '◻', label: 'Eraser' },
    { id: 'text' as ToolId, icon: 'T', label: 'Text' },
]

export default function LeftPanel({ activeTool, setActiveTool, toolColor, setToolColor, toolSize, setToolSize, activeFont, setActiveFont, onImageUpload, fileInputRef, accentColor }: Props) {
    return (
        <div style={{ width: 196, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
            <Block title="Tools" accent={accentColor}>
                {TOOLS.map(t => (
                    <button key={t.id} onClick={() => setActiveTool(t.id)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: 'none', background: activeTool === t.id ? `${accentColor}18` : 'transparent', color: activeTool === t.id ? accentColor : '#6B6B6B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, transition: 'all 0.15s', outline: activeTool === t.id ? `1px solid ${accentColor}35` : '1px solid transparent', fontFamily: 'Georgia,serif' }}
                        onMouseEnter={e => { if (activeTool !== t.id) { (e.currentTarget).style.color = '#F5F2ED'; (e.currentTarget).style.background = 'rgba(255,255,255,0.04)' } }}
                        onMouseLeave={e => { if (activeTool !== t.id) { (e.currentTarget).style.color = '#6B6B6B'; (e.currentTarget).style.background = 'transparent' } }}>
                        <span style={{ fontSize: t.id === 'text' ? 15 : 17, fontWeight: t.id === 'text' ? 900 : 400, width: 20, textAlign: 'center' }}>{t.icon}</span>
                        <span style={{ fontSize: 12, letterSpacing: 0.3 }}>{t.label}</span>
                        {activeTool === t.id && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: accentColor, boxShadow: `0 0 5px ${accentColor}` }} />}
                    </button>
                ))}
            </Block>

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

            <Block title="Size" accent={accentColor}>
                <input type="range" min="1" max="24" value={toolSize} onChange={e => setToolSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor, marginBottom: 8 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: Math.min(toolSize * 1.4, 22), height: Math.min(toolSize * 1.4, 22), borderRadius: '50%', background: toolColor, boxShadow: `0 0 8px ${toolColor}60`, transition: 'all 0.2s', flexShrink: 0 }} />
                    <span style={{ color: accentColor, fontSize: 11, fontFamily: 'monospace' }}>{toolSize}px</span>
                </div>
            </Block>

            <Block title="Handwriting" accent={accentColor}>
                {HANDWRITING_FONTS.map(f => (
                    <button key={f.id} onClick={() => setActiveFont(f)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: activeFont.id === f.id ? `${accentColor}15` : 'transparent', color: activeFont.id === f.id ? accentColor : '#6B6B6B', cursor: 'pointer', fontSize: 15, fontFamily: f.family, textAlign: 'left', outline: activeFont.id === f.id ? `1px solid ${accentColor}30` : '1px solid transparent', transition: 'all 0.15s', marginBottom: 2 }}
                        onMouseEnter={e => { if (activeFont.id !== f.id) { (e.currentTarget).style.color = '#F5F2ED'; (e.currentTarget).style.background = 'rgba(255,255,255,0.04)' } }}
                        onMouseLeave={e => { if (activeFont.id !== f.id) { (e.currentTarget).style.color = '#6B6B6B'; (e.currentTarget).style.background = 'transparent' } }}>
                        {f.name}
                    </button>
                ))}
            </Block>

            <button onClick={() => fileInputRef.current?.click()}
                style={{ padding: '12px', borderRadius: 11, border: `1px dashed ${accentColor}25`, background: 'transparent', color: '#6B6B6B', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = `${accentColor}60`; (e.currentTarget).style.color = accentColor; (e.currentTarget).style.background = `${accentColor}06` }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = `${accentColor}25`; (e.currentTarget).style.color = '#6B6B6B'; (e.currentTarget).style.background = 'transparent' }}>
                📷 Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} style={{ display: 'none' }} />
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