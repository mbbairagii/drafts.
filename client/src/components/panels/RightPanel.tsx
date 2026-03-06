import type { PanelId, Diary, DiaryPage, CoverId, ThemeId, Sticker } from '../../types'
import { COVER_STYLES, PAGE_THEMES, STICKERS } from '../../utils/constants'
import { formatDate } from '../../utils/helpers'

interface Props {
    activePanel: PanelId
    setActivePanel: (p: PanelId) => void
    diary: Diary
    currentPage: number
    pages: DiaryPage[]
    onAddSticker: (s: Sticker) => void
    onChangeTheme: (t: ThemeId) => void
    onChangeCover: (c: CoverId) => void
    onAddPage: () => void
    onDeletePage: (id: string) => void
    onGoToPage: (i: number) => void
    accentColor: string
    currentPageData: DiaryPage | null
}

const NAV = [
    { id: 'stickers' as PanelId, icon: '🎀', label: 'Stickers' },
    { id: 'themes' as PanelId, icon: '🎨', label: 'Themes' },
    { id: 'cover' as PanelId, icon: '📔', label: 'Cover' },
    { id: 'pages' as PanelId, icon: '📑', label: 'Pages' },
]

export default function RightPanel({ activePanel, setActivePanel, diary, currentPage, pages, onAddSticker, onChangeTheme, onChangeCover, onAddPage, onDeletePage, onGoToPage, accentColor, currentPageData }: Props) {
    return (
        <div style={{ width: 196, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 5 }}>
                {NAV.map(item => (
                    <button key={item.id} onClick={() => setActivePanel(item.id)}
                        style={{ padding: '9px 5px', borderRadius: 10, border: 'none', background: activePanel === item.id ? `${accentColor}18` : 'rgba(255,255,255,0.025)', color: activePanel === item.id ? accentColor : '#6B6B6B', cursor: 'pointer', fontSize: 10, fontFamily: 'Georgia,serif', letterSpacing: 0.3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, outline: activePanel === item.id ? `1px solid ${accentColor}35` : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { if (activePanel !== item.id) (e.currentTarget).style.color = '#F5F2ED' }}
                        onMouseLeave={e => { if (activePanel !== item.id) (e.currentTarget).style.color = '#6B6B6B' }}>
                        <span style={{ fontSize: 17 }}>{item.icon}</span>{item.label}
                    </button>
                ))}
            </div>

            {activePanel === 'stickers' && (
                <Block title="Stickers" accent={accentColor}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
                        {STICKERS.map(s => (
                            <button key={s.id} onClick={() => onAddSticker(s)} title={s.label}
                                style={{ fontSize: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 2px', cursor: 'pointer', transition: 'all 0.12s', lineHeight: 1 }}
                                onMouseEnter={e => { (e.currentTarget).style.transform = 'scale(1.22)'; (e.currentTarget).style.background = `${accentColor}20` }}
                                onMouseLeave={e => { (e.currentTarget).style.transform = 'scale(1)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.03)' }}>
                                {s.emoji}
                            </button>
                        ))}
                    </div>
                    <p style={{ color: '#2a2a2a', fontSize: 10, marginTop: 9, textAlign: 'center', fontFamily: 'Georgia,serif' }}>double-click to remove</p>
                </Block>
            )}

            {activePanel === 'themes' && (
                <Block title="Page Theme" accent={accentColor}>
                    {PAGE_THEMES.map(t => (
                        <button key={t.id} onClick={() => onChangeTheme(t.id as ThemeId)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: currentPageData?.theme === t.id ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.06)', background: t.bg, cursor: 'pointer', color: t.textColor, fontFamily: 'Georgia,serif', fontSize: 12, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, transition: 'all 0.2s', boxShadow: currentPageData?.theme === t.id ? `0 0 12px ${accentColor}30` : 'none' }}>
                            {t.name}
                            {currentPageData?.theme === t.id && <span style={{ color: accentColor, fontSize: 13 }}>✦</span>}
                        </button>
                    ))}
                </Block>
            )}

            {activePanel === 'cover' && (
                <Block title="Cover" accent={accentColor}>
                    {COVER_STYLES.map(c => (
                        <div key={c.id} onClick={() => onChangeCover(c.id as CoverId)}
                            style={{ height: 50, borderRadius: 10, background: c.bg, cursor: 'pointer', border: diary.cover === c.id ? `2px solid ${c.accent}` : '2px solid transparent', boxShadow: diary.cover === c.id ? `0 0 16px ${c.glow}` : '0 2px 8px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 7, transition: 'all 0.22s', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)'}>
                            {diary.cover === c.id && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle,${c.glow} 0%,transparent 70%)` }} />}
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.9)', letterSpacing: 1, textTransform: 'uppercase', zIndex: 1 }}>{c.name}</span>
                        </div>
                    ))}
                </Block>
            )}

            {activePanel === 'pages' && (
                <Block title="Pages" accent={accentColor}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 280, overflowY: 'auto', marginBottom: 8 }}>
                        {pages.map((p, i) => {
                            const pTheme = PAGE_THEMES.find(t => t.id === p.theme) || PAGE_THEMES[0]
                            return (
                                <div key={p._id} onClick={() => onGoToPage(i)}
                                    style={{ padding: '9px 11px', borderRadius: 9, border: currentPage === i ? `1px solid ${accentColor}50` : '1px solid rgba(255,255,255,0.05)', background: currentPage === i ? `${accentColor}10` : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.2s' }}>
                                    <div style={{ width: 26, height: 34, background: pTheme.bg, borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: currentPage === i ? `0 0 7px ${accentColor}40` : 'none' }}>
                                        <span style={{ fontSize: 8, color: pTheme.textColor, opacity: 0.35, fontFamily: 'monospace' }}>{i + 1}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: currentPage === i ? accentColor : '#F5F2ED', fontSize: 11, fontFamily: 'Georgia,serif', margin: 0 }}>page {i + 1}</p>
                                        <p style={{ color: '#2a2a2a', fontSize: 10, margin: '1px 0 0', fontFamily: 'monospace' }}>{pTheme.name}</p>
                                    </div>
                                    {pages.length > 1 && (
                                        <button onClick={e => { e.stopPropagation(); onDeletePage(p._id) }}
                                            style={{ background: 'transparent', border: 'none', color: '#2a2a2a', cursor: 'pointer', fontSize: 14, padding: '1px 3px', borderRadius: 3, transition: 'color 0.15s', lineHeight: 1 }}
                                            onMouseEnter={e => (e.currentTarget).style.color = '#ff2244'}
                                            onMouseLeave={e => (e.currentTarget).style.color = '#2a2a2a'}>×</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={onAddPage}
                        style={{ width: '100%', padding: '10px', borderRadius: 9, border: `1px dashed ${accentColor}25`, background: 'transparent', color: '#6B6B6B', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12, transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget).style.borderColor = `${accentColor}60`; (e.currentTarget).style.color = accentColor; (e.currentTarget).style.background = `${accentColor}06` }}
                        onMouseLeave={e => { (e.currentTarget).style.borderColor = `${accentColor}25`; (e.currentTarget).style.color = '#6B6B6B'; (e.currentTarget).style.background = 'transparent' }}>
                        + new page
                    </button>
                </Block>
            )}

            <Block title="Info" accent={accentColor}>
                {[['title', diary.name], ['pages', String(pages.length)], ['created', formatDate(diary.createdAt)], ['lock', diary.passwordHash ? '🔒 sealed' : '🔓 open']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: '#2a2a2a', fontSize: 11, fontFamily: 'Georgia,serif' }}>{k}</span>
                        <span style={{ color: '#F5F2ED', fontSize: 11, fontFamily: "'Caveat',cursive", maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                    </div>
                ))}
            </Block>
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