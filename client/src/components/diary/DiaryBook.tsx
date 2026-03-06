import type { Diary, DiaryPage, ToolId } from '../../types'
import { COVER_STYLES } from '../../utils/constants'
import PageCanvas from './PageCanvas'

interface Props {
    diary: Diary
    page: DiaryPage | null
    currentPage: number
    totalPages: number
    tool: ToolId
    toolColor: string
    toolSize: number
    fontFamily: string
    flipAnim: 'next' | 'prev' | null
    onUpdatePage: (p: DiaryPage) => void
    onFlip: (dir: 'next' | 'prev') => void
}

export default function DiaryBook({ diary, page, currentPage, totalPages, tool, toolColor, toolSize, fontFamily, flipAnim, onUpdatePage, onFlip }: Props) {
    const cover = COVER_STYLES.find(c => c.id === diary.cover) || COVER_STYLES[0]
    const canPrev = currentPage > 0
    const canNext = currentPage < totalPages - 1
    const animClass = flipAnim === 'next' ? 'anim-page-turn' : flipAnim === 'prev' ? 'anim-page-turn-back' : ''

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative' }}>
                <button onClick={() => canPrev && onFlip('prev')} disabled={!canPrev}
                    style={{ position: 'absolute', left: -54, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 42, height: 42, borderRadius: '50%', border: `1px solid ${canPrev ? cover.accent + '60' : 'rgba(255,255,255,0.05)'}`, background: canPrev ? `${cover.accent}12` : 'rgba(255,255,255,0.02)', color: canPrev ? cover.accent : '#2a2a2a', cursor: canPrev ? 'pointer' : 'not-allowed', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: canPrev ? `0 0 12px ${cover.glow}` : 'none' }}
                    onMouseEnter={e => { if (canPrev) (e.currentTarget).style.background = `${cover.accent}25` }}
                    onMouseLeave={e => { if (canPrev) (e.currentTarget).style.background = `${cover.accent}12` }}>‹</button>

                <div className={animClass} style={{ width: 520, height: 700, borderRadius: '3px 16px 16px 3px', position: 'relative', transformOrigin: 'left center', boxShadow: `16px 20px 70px rgba(0,0,0,0.8),-2px 0 24px rgba(0,0,0,0.5),0 0 50px ${cover.glow}` }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 26, height: '100%', background: cover.bg, zIndex: 5, borderRadius: '3px 0 0 3px', boxShadow: 'inset -4px 0 10px rgba(0,0,0,0.5),3px 0 10px rgba(0,0,0,0.3)' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.04) 0px,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 7px)', borderRadius: 'inherit' }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-90deg)', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.12)', fontSize: 7, letterSpacing: 3, fontFamily: 'Georgia,serif', textTransform: 'uppercase' }}>{diary.name}</div>
                    </div>

                    <div style={{ marginLeft: 26, height: '100%', borderRadius: '0 16px 16px 0', overflow: 'hidden' }}>
                        {page
                            ? <PageCanvas page={page} tool={tool} toolColor={toolColor} toolSize={toolSize} fontFamily={fontFamily} onUpdate={onUpdatePage} />
                            : <div style={{ width: '100%', height: '100%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#ccc', fontFamily: 'Georgia,serif' }}>loading...</p></div>
                        }
                    </div>

                    <div style={{ position: 'absolute', top: 0, left: 26, right: 0, height: '100%', background: 'linear-gradient(to right,rgba(0,0,0,0.1) 0%,transparent 7%)', pointerEvents: 'none', zIndex: 4 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 2, height: '100%', background: `linear-gradient(to bottom,transparent,${cover.accent}25,${cover.accent}15,transparent)`, borderRadius: '0 16px 16px 0', pointerEvents: 'none', zIndex: 6 }} />
                    <div style={{ position: 'absolute', bottom: 14, right: 18, color: 'rgba(160,140,100,0.4)', fontSize: 11, fontFamily: 'Georgia,serif', zIndex: 10, userSelect: 'none' }}>{currentPage + 1} / {totalPages}</div>
                    <div style={{ position: 'absolute', top: 14, left: 38, right: 18, color: 'rgba(160,140,100,0.3)', fontSize: 10, fontFamily: 'Georgia,serif', zIndex: 10, textAlign: 'right', letterSpacing: 0.5, userSelect: 'none' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    <div style={{ position: 'absolute', right: -5, top: '18%', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
                        {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => <div key={i} style={{ width: 12, height: 9, borderRadius: '0 3px 3px 0', background: i === currentPage % 8 ? cover.accent : 'rgba(255,255,255,0.05)', boxShadow: i === currentPage % 8 ? `0 0 7px ${cover.glow}` : 'none', transition: 'all 0.3s' }} />)}
                    </div>
                </div>

                <button onClick={() => canNext && onFlip('next')} disabled={!canNext}
                    style={{ position: 'absolute', right: -54, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 42, height: 42, borderRadius: '50%', border: `1px solid ${canNext ? cover.accent + '60' : 'rgba(255,255,255,0.05)'}`, background: canNext ? `${cover.accent}12` : 'rgba(255,255,255,0.02)', color: canNext ? cover.accent : '#2a2a2a', cursor: canNext ? 'pointer' : 'not-allowed', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: canNext ? `0 0 12px ${cover.glow}` : 'none' }}
                    onMouseEnter={e => { if (canNext) (e.currentTarget).style.background = `${cover.accent}25` }}
                    onMouseLeave={e => { if (canNext) (e.currentTarget).style.background = `${cover.accent}12` }}>›</button>
            </div>

            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <div key={i} onClick={() => onFlip(i > currentPage ? 'next' : 'prev')} style={{ width: i === currentPage ? 24 : 7, height: 7, borderRadius: 4, background: i === currentPage ? cover.accent : 'rgba(255,255,255,0.08)', boxShadow: i === currentPage ? `0 0 8px ${cover.glow}` : 'none', transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer' }} />
                ))}
            </div>
        </div>
    )
}