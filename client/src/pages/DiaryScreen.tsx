import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDiary } from '../hooks/useDiary'
import { COVER_STYLES, HANDWRITING_FONTS } from '../utils/constants'
import { generateId } from '../utils/helpers'
import type { Diary, DiaryPage, ToolId, PanelId, CoverId, ThemeId, HandwritingFont, Sticker } from '../types'
import DiaryBook from '../components/diary/DiaryBook'
import LeftPanel from '../components/panels/LeftPanel'
import RightPanel from '../components/panels/RightPanel'
import CustomCursor from '../components/ui/CustomCursor'
import ParticleDust from '../components/ui/ParticleDust'
import NoiseOverlay from '../components/ui/NoiseOverlay'

const INK = '#06050A'
const DIM = (a: number) => `rgba(237,232,223,${a})`

export default function DiaryScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { getDiary, updateDiary, getPages, addPage, updatePage, deletePage } = useDiary()

    const [diary, setDiary] = useState<Diary | null>(null)
    const [pages, setPages] = useState<DiaryPage[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [flipAnim, setFlipAnim] = useState<'next' | 'prev' | null>(null)
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)   // diary starts closed

    const [activeTool, setActiveTool] = useState<ToolId>('pen')
    const [toolColor, setToolColor] = useState('#1a0f00')
    const [toolSize, setToolSize] = useState(3)
    const [activeFont, setActiveFont] = useState<HandwritingFont>(HANDWRITING_FONTS[0])
    const [rightPanel, setRightPanel] = useState<PanelId>('stickers')

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!id) return
        Promise.all([getDiary(id), getPages(id)])
            .then(([diaryData, pagesData]) => {
                setDiary(diaryData)
                setPages(pagesData)
                setLoading(false)
            })
            .catch(() => navigate('/'))
    }, [id])

    const cover = diary
        ? COVER_STYLES.find(c => c.id === diary.cover) || COVER_STYLES[0]
        : COVER_STYLES[0]

    const debouncedSave = useCallback((diaryId: string, pageId: string, data: Partial<DiaryPage>) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => updatePage(diaryId, pageId, data), 800)
    }, [])

    const handleUpdatePage = useCallback((updated: DiaryPage) => {
        setPages(prev => prev.map(p => p._id === updated._id ? updated : p))
        if (id) debouncedSave(id, updated._id, {
            drawingData: updated.drawingData,
            textElements: updated.textElements,
            stickers: updated.stickers,
            images: updated.images,
        })
    }, [id, debouncedSave])

    const handleFlip = (dir: 'next' | 'prev') => {
        if (flipAnim) return                              // ← add this guard
        const next = dir === 'next' ? currentPage + 1 : currentPage - 1
        if (next < 0 || next >= pages.length) return
        setFlipAnim(dir)
        setTimeout(() => { setCurrentPage(next); setFlipAnim(null) }, 500)
    }


    const handleGoToPage = (i: number) => {
        if (i === currentPage) return
        setFlipAnim(i > currentPage ? 'next' : 'prev')
        setTimeout(() => { setCurrentPage(i); setFlipAnim(null) }, 500)
    }

    // Stickers can be added even when diary is closed — they land on the current page
    const handleAddSticker = (s: Sticker) => {
        const page = pages[currentPage]
        if (!page) return
        handleUpdatePage({
            ...page,
            stickers: [...(page.stickers || []), {
                id: generateId(),
                emoji: s.emoji,
                x: 60 + Math.random() * 280,
                y: 80 + Math.random() * 380,
                size: 34 + Math.random() * 12,
                rotation: (Math.random() - 0.5) * 24,
            }],
        })
    }

    const handleChangeTheme = async (themeId: ThemeId) => {
        const page = pages[currentPage]
        if (!page || !id) return
        const updated = { ...page, theme: themeId }
        setPages(prev => prev.map(p => p._id === page._id ? updated : p))
        await updatePage(id, page._id, { theme: themeId })
    }

    const handleChangeCover = async (coverId: CoverId) => {
        if (!diary || !id) return
        setDiary({ ...diary, cover: coverId })
        await updateDiary(id, { cover: coverId })
    }

    const handleAddPage = async () => {
        if (!id) return
        const newPage = await addPage(id, pages[currentPage]?.theme || 'aged')
        setPages(prev => {
            const updated = [...prev, newPage]
            setFlipAnim('next')
            setTimeout(() => { setCurrentPage(updated.length - 1); setFlipAnim(null) }, 500)
            return updated
        })
    }

    const handleDeletePage = async (pageId: string) => {
        if (!id || pages.length <= 1) return
        await deletePage(id, pageId)
        setPages(prev => {
            const updated = prev.filter(p => p._id !== pageId)
            setCurrentPage(i => Math.min(i, updated.length - 1))
            return updated
        })
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => {
            const page = pages[currentPage]
            if (!page) return
            handleUpdatePage({
                ...page,
                images: [...(page.images || []), {
                    id: generateId(),
                    src: ev.target?.result as string,
                    x: 40 + Math.random() * 60,
                    y: 60 + Math.random() * 60,
                    width: 190,
                    height: 150,
                }],
            })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    // ── Loading ─────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ height: '100vh', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital@1&display=swap');
                @keyframes ds-breathe { 0%,100%{opacity:0.18} 50%{opacity:0.55} }
            `}</style>
            <p style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontStyle: 'italic', fontSize: 30, color: DIM(0.4), margin: 0, letterSpacing: '-0.02em', animation: 'ds-breathe 2.2s ease-in-out infinite' }}>
                drafts.
            </p>
        </div>
    )

    if (!diary) return null

    return (
        <div style={{ height: '100vh', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');

                @keyframes ds-panel-left  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
                @keyframes ds-panel-right { from{opacity:0;transform:translateX(16px)}  to{opacity:1;transform:translateX(0)} }
                @keyframes ds-topbar      { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

                .ds-panel-left  { animation: ds-panel-left  0.55s cubic-bezier(0.2,1,0.3,1) both; }
                .ds-panel-right { animation: ds-panel-right 0.55s 0.07s cubic-bezier(0.2,1,0.3,1) both; }
                .ds-topbar      { animation: ds-topbar      0.5s  0.05s cubic-bezier(0.2,1,0.3,1) both; }

                * { box-sizing:border-box; }
                ::-webkit-scrollbar { width:3px; }
                ::-webkit-scrollbar-track { background:transparent; }
                ::-webkit-scrollbar-thumb { background:rgba(200,160,90,0.15); border-radius:2px; }
            `}</style>

            <ParticleDust />
            <NoiseOverlay />
            <CustomCursor tool={activeTool} color={toolColor} />

            {/* Cover-tinted ambient glow */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${cover.glow} 0%, transparent 65%)`, opacity: 0.22, pointerEvents: 'none', zIndex: 0 }} />

            {/* Layout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%', maxWidth: 1300, padding: '0 18px', height: '100vh', position: 'relative', zIndex: 10 }}>

                {/* ── Left panel ── */}
                <div className="ds-panel-left" style={{ width: 196, height: 'calc(100vh - 32px)', paddingTop: 56, flexShrink: 0, overflowY: 'auto' }}>
                    <LeftPanel
                        activeTool={activeTool}
                        setActiveTool={setActiveTool}
                        toolColor={toolColor}
                        setToolColor={setToolColor}
                        toolSize={toolSize}
                        setToolSize={setToolSize}
                        activeFont={activeFont}
                        setActiveFont={setActiveFont}
                        onImageUpload={handleImageUpload}
                        fileInputRef={fileInputRef}
                        accentColor={cover.accent}
                    />
                </div>

                {/* ── Centre ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    {/* Top bar */}
                    <div className="ds-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 560, marginBottom: 14 }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{ padding: '7px 16px', borderRadius: 18, border: `1px solid ${cover.accent}25`, background: 'transparent', color: DIM(0.35), cursor: 'pointer', fontSize: 11, fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.1em', transition: 'all 0.2s', outline: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = cover.accent + '60'; e.currentTarget.style.color = cover.accent }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = cover.accent + '25'; e.currentTarget.style.color = DIM(0.35) }}
                        >← drafts.</button>

                        <h2 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontStyle: 'italic', fontSize: 20, color: DIM(0.85), margin: 0, letterSpacing: '-0.01em', textShadow: `0 0 24px ${cover.glow}` }}>
                            {diary.name}
                        </h2>

                        <span style={{ color: DIM(0.2), fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                            {currentPage + 1}/{pages.length}
                        </span>
                    </div>

                    {/* Book */}
                    <DiaryBook
                        diary={diary}
                        page={pages[currentPage] || null}
                        currentPage={currentPage}
                        totalPages={pages.length}
                        tool={activeTool}
                        toolColor={toolColor}
                        toolSize={toolSize}
                        fontFamily={activeFont.family}
                        flipAnim={flipAnim}
                        onUpdatePage={handleUpdatePage}
                        onFlip={handleFlip}
                        isOpen={isOpen}
                        onOpen={() => setIsOpen(true)}
                    />
                </div>

                {/* ── Right panel ── */}
                <div className="ds-panel-right" style={{ width: 196, height: 'calc(100vh - 32px)', paddingTop: 56, flexShrink: 0, overflowY: 'auto' }}>
                    <RightPanel
                        activePanel={rightPanel}
                        setActivePanel={setRightPanel}
                        diary={diary}
                        currentPage={currentPage}
                        pages={pages}
                        onAddSticker={handleAddSticker}
                        onChangeTheme={handleChangeTheme}
                        onChangeCover={handleChangeCover}
                        onAddPage={handleAddPage}
                        onDeletePage={handleDeletePage}
                        onGoToPage={handleGoToPage}
                        accentColor={cover.accent}
                        currentPageData={pages[currentPage] || null}
                    />
                </div>
            </div>
        </div>
    )
}