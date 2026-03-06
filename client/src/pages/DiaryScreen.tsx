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

export default function DiaryScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { getDiary, updateDiary, getPages, addPage, updatePage, deletePage } = useDiary()

    const [diary, setDiary] = useState<Diary | null>(null)
    const [pages, setPages] = useState<DiaryPage[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [flipAnim, setFlipAnim] = useState<'next' | 'prev' | null>(null)
    const [loading, setLoading] = useState(true)

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
        saveTimeout.current = setTimeout(() => {
            updatePage(diaryId, pageId, data)
        }, 800)
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

    const handleAddSticker = (s: Sticker) => {
        const page = pages[currentPage]
        if (!page) return
        const newSticker = {
            id: generateId(),
            emoji: s.emoji,
            x: 60 + Math.random() * 280,
            y: 80 + Math.random() * 380,
            size: 34 + Math.random() * 12,
            rotation: (Math.random() - 0.5) * 24,
        }
        handleUpdatePage({ ...page, stickers: [...(page.stickers || []), newSticker] })
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
        const updated = { ...diary, cover: coverId }
        setDiary(updated)
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
            const img = {
                id: generateId(),
                src: ev.target?.result as string,
                x: 40 + Math.random() * 60,
                y: 60 + Math.random() * 60,
                width: 190,
                height: 150,
            }
            handleUpdatePage({ ...page, images: [...(page.images || []), img] })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    if (loading) return (
        <div style={{ height: '100vh', background: '#0C0C0C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: "'IM Fell English',serif", fontSize: 22, color: '#2a2a2a', letterSpacing: 3 }}>drafts.</p>
        </div>
    )

    if (!diary) return null

    return (
        <div style={{ height: '100vh', background: '#0C0C0C', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <ParticleDust />
            <NoiseOverlay />
            <CustomCursor tool={activeTool} color={toolColor} />

            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%,${cover.glow} 0%,transparent 65%)`, pointerEvents: 'none', opacity: 0.25 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%', maxWidth: 1300, padding: '0 18px', height: '100vh', position: 'relative', zIndex: 10 }}>
                <div style={{ width: 196, height: 'calc(100vh - 32px)', paddingTop: 56, flexShrink: 0, overflowY: 'auto' }}>
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

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 560, marginBottom: 14 }}>
                        <button onClick={() => navigate('/')}
                            style={{ padding: '7px 16px', borderRadius: 18, border: `1px solid ${cover.accent}25`, background: 'transparent', color: '#6B6B6B', cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia,serif', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget).style.borderColor = cover.accent + '60'; (e.currentTarget).style.color = cover.accent }}
                            onMouseLeave={e => { (e.currentTarget).style.borderColor = cover.accent + '25'; (e.currentTarget).style.color = '#6B6B6B' }}>
                            ← drafts.
                        </button>
                        <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontSize: 20, color: '#F5F2ED', margin: 0, textShadow: `0 0 18px ${cover.glow}` }}>{diary.name}</h2>
                        <span style={{ color: '#2a2a2a', fontSize: 11, fontFamily: 'monospace' }}>{currentPage + 1}/{pages.length}</span>
                    </div>

                    <div className="anim-diary-open">
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
                        />
                    </div>
                </div>

                <div style={{ width: 196, height: 'calc(100vh - 32px)', paddingTop: 56, flexShrink: 0, overflowY: 'auto' }}>
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