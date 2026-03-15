import { useState, useRef } from 'react'
import type { Diary, DiaryPage, ThemeId, CoverId, PanelId } from '../../types'
import { COVER_STYLES, PAGE_THEMES } from '../../utils/constants'

interface Props {
    activePanel: PanelId
    setActivePanel: (p: PanelId) => void
    diary: Diary
    currentPage: number
    pages: DiaryPage[]
    onAddSticker: (s: { emoji?: string; src?: string }) => void
    onChangeTheme: (t: ThemeId) => void
    onChangeCover: (c: CoverId) => void
    onAddPage: () => void
    onDeletePage: (id: string) => void
    onGoToPage: (i: number) => void
    accentColor: string
    currentPageData: DiaryPage | null
}

const BUILT_IN_STICKERS = [
    { id: 's1', src: '/stickers/s1.png', name: 'Moonlit Lily' },
    { id: 's2', src: '/stickers/s2.png', name: 'Rose Lunar Seal' },
    { id: 's3', src: '/stickers/s3.png', name: 'Midnight Medallion' },
    { id: 's4', src: '/stickers/s4.png', name: 'Wandering Wings' },
    { id: 's5', src: '/stickers/s5.png', name: 'Nocturne Flutter' },
    { id: 's6', src: '/stickers/s6.png', name: 'Storybook Whisper' },
    { id: 's7', src: '/stickers/s7.png', name: 'The Last Queen' },
    { id: 's8', src: '/stickers/s8.png', name: 'Crimson Cherries' },
    { id: 's9', src: '/stickers/s9.png', name: 'Scarlet Kiss' },
    { id: 's10', src: '/stickers/s10.png', name: 'Ink Bloom' },
    { id: 's11', src: '/stickers/s11.png', name: 'Shadow Cat' },
    { id: 's12', src: '/stickers/s12.png', name: 'Shakespearean Echo' },
    { id: 's13', src: '/stickers/s13.png', name: 'Golden Locket' },
    { id: 's14', src: '/stickers/s14.png', name: "Van Gogh's Reverie" },
    { id: 's15', src: '/stickers/s15.png', name: 'Coral Hibiscus' },
]

const EMOJI_SETS = [
    { tab: '✨', emojis: ['✨', '💫', '⭐', '🌟', '🌙', '☀️', '🌈', '🔮', '🪄', '💎', '👑', '🕯️', '🌠', '⚡', '🪐', '🌌', '💠', '🪬', '🔯', '🎆'] },
    { tab: '🌸', emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '🌿', '🌱', '🍁', '🍂', '🍃', '🌾', '🌊', '🌴', '🪴', '🎋', '🪷', '🌵', '🌲', '🌳'] },
    { tab: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💝', '💘', '💟', '❣️', '💔', '🩷'] },
    { tab: '🍒', emojis: ['🍒', '🍓', '🍑', '🍋', '🍰', '🧁', '🍫', '🍬', '🍷', '🥂', '☕', '🍵', '🧋', '🍦', '🎂', '🍭', '🥐', '🫖', '🍩', '🧃'] },
    { tab: '🦋', emojis: ['🦋', '🐝', '🦚', '🦜', '🕊️', '🐚', '🐱', '🍄', '🐇', '🦊', '🐉', '🦩', '🦢', '🦦', '🦄', '🐿️', '🦔', '🐬', '🦋', '🌙'] },
]

const NAV: { id: PanelId; icon: string; label: string }[] = [
    { id: 'stickers', icon: '🎭', label: 'Stickers' },
    { id: 'pages', icon: '📄', label: 'Pages' },
    { id: 'cover', icon: '📖', label: 'Cover' },
]

export default function RightPanel({
    activePanel, setActivePanel, diary, currentPage, pages,
    onAddSticker, onChangeTheme, onChangeCover, onAddPage, onDeletePage, onGoToPage,
    accentColor, currentPageData,
}: Props) {
    const [stickerTab, setStickerTab] = useState<'library' | 'emojis'>('library')
    const [emojiCat, setEmojiCat] = useState(0)
    const [customStickers, setCustomStickers] = useState<{ id: string; src: string; name: string }[]>(() => {
        try { return JSON.parse(localStorage.getItem('drafts_custom_stickers') || '[]') } catch { return [] }
    })
    const fileRef = useRef<HTMLInputElement | null>(null)

    const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => {
            const ns = { id: `c-${Date.now()}`, src: ev.target?.result as string, name: file.name.replace(/\.[^.]+$/, '') }
            const updated = [...customStickers, ns]
            setCustomStickers(updated)
            localStorage.setItem('drafts_custom_stickers', JSON.stringify(updated))
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const removeCustom = (id: string) => {
        const updated = customStickers.filter(s => s.id !== id)
        setCustomStickers(updated)
        localStorage.setItem('drafts_custom_stickers', JSON.stringify(updated))
    }

    return (
        <div style={{ width: 196, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>

            <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.025)', borderRadius: 11, padding: 4 }}>
                {NAV.map(n => (
                    <button key={n.id} onClick={() => setActivePanel(n.id)}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: activePanel === n.id ? `${accentColor}20` : 'transparent', color: activePanel === n.id ? accentColor : '#4a4a4a', cursor: 'pointer', fontSize: 14, outline: activePanel === n.id ? `1px solid ${accentColor}30` : 'none', transition: 'all 0.15s' }}
                        title={n.label}
                    >{n.icon}</button>
                ))}
            </div>

            {activePanel === 'stickers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: 3, gap: 3 }}>
                        {(['library', 'emojis'] as const).map(t => (
                            <button key={t} onClick={() => setStickerTab(t)}
                                style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', background: stickerTab === t ? `${accentColor}20` : 'transparent', color: stickerTab === t ? accentColor : '#4a4a4a', cursor: 'pointer', fontSize: 9, letterSpacing: '0.1em', fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase', transition: 'all 0.15s', outline: 'none' }}>
                                {t === 'library' ? '🎭 Library' : '😊 Emojis'}
                            </button>
                        ))}
                    </div>

                    {stickerTab === 'library' && (
                        <>
                            <Block title="Ethereal Library" accent={accentColor}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                                    {BUILT_IN_STICKERS.map(s => (
                                        <div key={s.id} onClick={() => onAddSticker({ src: s.src })}
                                            title={s.name}
                                            style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}55`; e.currentTarget.style.background = `${accentColor}12`; e.currentTarget.style.transform = 'scale(1.06)' }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1)' }}>
                                            <img src={s.src} alt={s.name} style={{ width: '78%', height: '78%', objectFit: 'contain' }} draggable={false} />
                                        </div>
                                    ))}
                                </div>
                            </Block>

                            {customStickers.length > 0 && (
                                <Block title="My Stickers" accent={accentColor}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                                        {customStickers.map(s => (
                                            <div key={s.id}
                                                style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}55`; e.currentTarget.style.background = `${accentColor}12`; e.currentTarget.style.transform = 'scale(1.06)' }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1)' }}>
                                                <img src={s.src} alt={s.name} onClick={() => onAddSticker({ src: s.src })} style={{ width: '78%', height: '78%', objectFit: 'contain' }} draggable={false} />
                                                <button onClick={e => { e.stopPropagation(); removeCustom(s.id) }}
                                                    style={{ position: 'absolute', top: 2, right: 2, width: 15, height: 15, borderRadius: '50%', background: 'rgba(255,30,60,0.85)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </Block>
                            )}

                            <button onClick={() => fileRef.current?.click()}
                                style={{ padding: '10px', borderRadius: 9, border: `1px dashed ${accentColor}30`, background: 'transparent', color: '#4a4a4a', cursor: 'pointer', fontSize: 10, fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', outline: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}70`; e.currentTarget.style.color = accentColor }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = `${accentColor}30`; e.currentTarget.style.color = '#4a4a4a' }}>
                                + Add Custom Sticker
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleCustomUpload} style={{ display: 'none' }} />
                        </>
                    )}

                    {stickerTab === 'emojis' && (
                        <Block title="Emojis" accent={accentColor}>
                            <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                                {EMOJI_SETS.map((s, i) => (
                                    <button key={i} onClick={() => setEmojiCat(i)}
                                        style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', background: emojiCat === i ? `${accentColor}22` : 'transparent', cursor: 'pointer', fontSize: 13, outline: 'none', transition: 'all 0.15s', opacity: emojiCat === i ? 1 : 0.4 }}>
                                        {s.tab}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3 }}>
                                {EMOJI_SETS[emojiCat].emojis.map((em, i) => (
                                    <button key={i} onClick={() => onAddSticker({ emoji: em })}
                                        style={{ aspectRatio: '1', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', outline: 'none' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}18`; e.currentTarget.style.transform = 'scale(1.25)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'scale(1)' }}>
                                        {em}
                                    </button>
                                ))}
                            </div>
                        </Block>
                    )}
                </div>
            )}

            {activePanel === 'pages' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                    <Block title="Pages" accent={accentColor}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 280, overflowY: 'auto' }}>
                            {pages.map((p, i) => (
                                <div key={p._id} onClick={() => onGoToPage(i)}
                                    style={{ padding: '8px 10px', borderRadius: 8, background: i === currentPage ? `${accentColor}18` : 'transparent', border: `1px solid ${i === currentPage ? accentColor + '40' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { if (i !== currentPage) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                                    onMouseLeave={e => { if (i !== currentPage) e.currentTarget.style.background = 'transparent' }}>
                                    <span style={{ color: i === currentPage ? accentColor : '#555', fontSize: 12, fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>Page {i + 1}</span>
                                    {i === currentPage && <div style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />}
                                </div>
                            ))}
                        </div>

                        <button onClick={onAddPage}
                            style={{ width: '100%', marginTop: 8, padding: '9px', borderRadius: 8, border: `1px dashed ${accentColor}30`, background: 'transparent', color: '#4a4a4a', cursor: 'pointer', fontSize: 10, fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.1em', transition: 'all 0.2s', outline: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}70`; e.currentTarget.style.color = accentColor }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = `${accentColor}30`; e.currentTarget.style.color = '#4a4a4a' }}>
                            + New Page
                        </button>

                        {pages.length > 1 && currentPageData && (
                            <button onClick={() => onDeletePage(currentPageData._id)}
                                style={{ width: '100%', marginTop: 4, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,50,50,0.12)', background: 'transparent', color: 'rgba(255,80,80,0.35)', cursor: 'pointer', fontSize: 10, fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.06em', transition: 'all 0.2s', outline: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,50,50,0.4)'; e.currentTarget.style.color = 'rgba(255,80,80,0.75)' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,50,50,0.12)'; e.currentTarget.style.color = 'rgba(255,80,80,0.35)' }}>
                                Delete This Page
                            </button>
                        )}
                    </Block>

                    <Block title="Page Theme" accent={accentColor}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {PAGE_THEMES.map(t => (
                                <button key={t.id} onClick={() => onChangeTheme(t.id as ThemeId)}
                                    style={{ padding: '7px 10px', borderRadius: 7, border: `1px solid ${currentPageData?.theme === t.id ? accentColor + '50' : 'transparent'}`, background: currentPageData?.theme === t.id ? `${accentColor}12` : 'transparent', color: currentPageData?.theme === t.id ? accentColor : '#4a4a4a', cursor: 'pointer', fontSize: 11, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s', outline: 'none' }}
                                    onMouseEnter={e => { if (currentPageData?.theme !== t.id) { e.currentTarget.style.color = '#999'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
                                    onMouseLeave={e => { if (currentPageData?.theme !== t.id) { e.currentTarget.style.color = '#4a4a4a'; e.currentTarget.style.background = 'transparent' } }}>
                                    <div style={{ width: 13, height: 13, borderRadius: 3, background: t.bg, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </Block>
                </div>
            )}

            {activePanel === 'cover' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                    <Block title="Cover Style" accent={accentColor}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {COVER_STYLES.map(c => (
                                <button key={c.id} onClick={() => onChangeCover(c.id as CoverId)}
                                    style={{ padding: '10px 12px', borderRadius: 9, border: `1px solid ${diary.cover === c.id ? c.accent + '60' : 'rgba(255,255,255,0.05)'}`, background: diary.cover === c.id ? `${c.accent}12` : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', outline: 'none' }}
                                    onMouseEnter={e => { if (diary.cover !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                                    onMouseLeave={e => { if (diary.cover !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ width: 26, height: 26, borderRadius: 5, background: c.bg, border: `1px solid ${c.accent}30`, flexShrink: 0 }} />
                                    <span style={{ color: diary.cover === c.id ? c.accent : '#555', fontSize: 11, fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>{c.id}</span>
                                    {diary.cover === c.id && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: c.accent, boxShadow: `0 0 6px ${c.accent}` }} />}
                                </button>
                            ))}
                        </div>
                    </Block>
                </div>
            )}
        </div>
    )
}

function Block({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 13, padding: 13, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: `${accent}60`, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'Georgia,serif', fontWeight: 700 }}>{title}</p>
            {children}
        </div>
    )
}
