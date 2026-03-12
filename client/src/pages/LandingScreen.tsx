import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import skullImg from '../assets/00.png'
import handImg from '../assets/01.png'

const INK = '#06050A'
const OFF = '#EDE8DF'
const RUST = '#7C3318'
const DIM = (a: number) => `rgba(237,232,223,${a})`
const FONT = "'Libre Baskerville', Georgia, serif"
const SANS = "'DM Sans', system-ui, sans-serif"

const ABOUT_FEATURES = [
    { n: '01', t: 'Realistic diary', b: 'A physical book at center screen. Leather cover, elastic band. Click open, flip real pages.' },
    { n: '02', t: 'Custom handwriting font', b: 'Upload a photo of your alphabet. Every word you type appears in your own handwriting.' },
    { n: '03', t: 'Draw & annotate', b: 'Pen, pencil, highlighter, eraser. Draw directly on any page with a full canvas layer.' },
    { n: '04', t: 'Stickers & photos', b: 'Drag stickers onto pages. Upload photos and place them like a scrapbook.' },
    { n: '05', t: 'Six cover styles', b: 'Full grain leather. Aged vellum. Scarlet morocco. Midnight cloth. Raw linen. Bone paper.' },
    { n: '06', t: 'Password protected', b: 'Every diary locks with a password or pattern. Encrypted at rest. We store ciphertext only.' },
    { n: '07', t: 'Page flip animation', b: 'Physics-based page turns that feel exactly like a real book.' },
    { n: '08', t: 'Zero ads, zero tracking', b: 'Your thoughts are not a product. No ads, no analytics, no selling your data. Ever.' },
]

export default function LandingScreen() {
    const navigate = useNavigate()
    const trackRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef(0)
    const targetX = useRef(0)
    const currentX = useRef(0)

    const [pct, setPct] = useState(0)
    const [loaderDone, setLoaderDone] = useState(false)
    const [loaderGone, setLoaderGone] = useState(false)
    const [progress, setProgress] = useState(0)
    const [aboutOpen, setAboutOpen] = useState(false)
    const [activePanel, setActivePanel] = useState(0)

    useEffect(() => {
        let cur = 0
        const iv = setInterval(() => {
            cur = Math.min(100, cur + Math.random() * 8 + 2)
            setPct(Math.round(cur))
            if (cur >= 100) {
                clearInterval(iv)
                setTimeout(() => setLoaderDone(true), 400)
                setTimeout(() => setLoaderGone(true), 1300)
            }
        }, 85)
        return () => clearInterval(iv)
    }, [])

    useEffect(() => {
        if (!loaderGone) return
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const getMax = () => trackRef.current ? trackRef.current.scrollWidth - window.innerWidth : 0

        const onWheel = (e: WheelEvent) => { e.preventDefault(); targetX.current += e.deltaY * 1.05 + e.deltaX * 0.5 }
        let ty = 0
        const onTS = (e: TouchEvent) => { ty = e.touches[0].clientY }
        const onTM = (e: TouchEvent) => { e.preventDefault(); targetX.current += (ty - e.touches[0].clientY) * 1.3; ty = e.touches[0].clientY }
        const onKey = (e: KeyboardEvent) => {
            if (['ArrowRight', 'ArrowDown'].includes(e.key)) targetX.current += window.innerWidth * 0.85
            if (['ArrowLeft', 'ArrowUp'].includes(e.key)) targetX.current -= window.innerWidth * 0.85
        }
        const tick = () => {
            const max = getMax()
            targetX.current = Math.max(0, Math.min(targetX.current, max))
            currentX.current = lerp(currentX.current, targetX.current, 0.068)
            if (trackRef.current) trackRef.current.style.transform = `translateX(${-currentX.current}px)`
            const p = max > 0 ? currentX.current / max : 0
            setProgress(p)
            setActivePanel(p > 0.5 ? 1 : 0)
            rafRef.current = requestAnimationFrame(tick)
        }
        window.addEventListener('wheel', onWheel, { passive: false })
        window.addEventListener('touchstart', onTS, { passive: true })
        window.addEventListener('touchmove', onTM, { passive: false })
        window.addEventListener('keydown', onKey)
        rafRef.current = requestAnimationFrame(tick)
        return () => {
            window.removeEventListener('wheel', onWheel)
            window.removeEventListener('touchstart', onTS)
            window.removeEventListener('touchmove', onTM)
            window.removeEventListener('keydown', onKey)
            cancelAnimationFrame(rafRef.current)
        }
    }, [loaderGone])

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        html, body, #root { height: 100%; overflow: hidden; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes loaderExit {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(.99); }
        }
        @keyframes counterTick {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes wordRise {
          0%   { transform: translateY(110%); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes imgScale {
          from { transform: scale(1.06); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes lineExpand {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes driftLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes barFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes loaderLineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheetUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .btn-solid {
          position: relative; overflow: hidden;
          font-family: ${SANS}; font-size: 10px; font-weight: 500;
          letter-spacing: .34em; text-transform: uppercase;
          color: ${INK}; background: ${OFF}; border: none;
          padding: 15px 42px; cursor: pointer;
        }
        .btn-solid::after {
          content: ''; position: absolute; inset: 0; background: ${RUST};
          transform: translateY(102%);
          transition: transform .44s cubic-bezier(.16,1,.3,1);
        }
        .btn-solid:hover::after { transform: translateY(0); }
        .btn-solid span { position: relative; z-index: 1; transition: color .44s; }
        .btn-solid:hover span { color: ${OFF}; }

        .btn-ghost {
          position: relative; overflow: hidden;
          font-family: ${SANS}; font-size: 10px; font-weight: 400;
          letter-spacing: .34em; text-transform: uppercase;
          color: ${DIM(.38)}; background: transparent;
          border: 1px solid ${DIM(.14)}; padding: 15px 42px; cursor: pointer;
          transition: border-color .3s;
        }
        .btn-ghost::after {
          content: ''; position: absolute; inset: 0; background: ${DIM(.06)};
          transform: translateX(-102%);
          transition: transform .44s cubic-bezier(.16,1,.3,1);
        }
        .btn-ghost:hover::after { transform: translateX(0); }
        .btn-ghost span { position: relative; z-index: 1; transition: color .3s; }
        .btn-ghost:hover span { color: ${OFF}; }
        .btn-ghost:hover { border-color: ${DIM(.32)}; }

        .nav-about {
          font-family: ${SANS}; font-size: 10px; font-weight: 400;
          letter-spacing: .34em; text-transform: uppercase;
          color: ${DIM(.3)}; background: none; border: none;
          padding: 10px 18px; cursor: pointer; position: relative;
          transition: color .25s;
        }
        .nav-about::after {
          content: ''; position: absolute; bottom: 5px; left: 18px; right: 18px;
          height: 1px; background: ${RUST};
          transform: scaleX(0); transform-origin: left;
          transition: transform .32s cubic-bezier(.16,1,.3,1);
        }
        .nav-about:hover { color: ${OFF}; }
        .nav-about:hover::after { transform: scaleX(1); }

        .stat-card { cursor: default; transition: transform .35s cubic-bezier(.16,1,.3,1); }
        .stat-card:hover { transform: translateY(-5px); }

        .feature-row { border-top: 1px solid ${DIM(.06)}; padding: 22px 0; transition: border-color .28s; }
        .feature-row:hover { border-top-color: ${DIM(.2)}; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${DIM(.08)}; }
      `}</style>

            {/* ══════════════════════════════════
          LOADER
      ══════════════════════════════════ */}
            {!loaderGone && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: INK,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '44px 52px',
                    animation: loaderDone ? 'loaderExit .85s .05s cubic-bezier(.7,0,.84,0) both' : 'none',
                    pointerEvents: loaderDone ? 'none' : 'auto',
                }}>

                    <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 20, color: OFF, opacity: .7, letterSpacing: '-.01em' }}>drafts.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>

                        <p style={{ fontFamily: SANS, fontSize: 8, color: DIM(.18), letterSpacing: '.6em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 28 }}>opening journal</p>

                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <p
                                key={pct}
                                style={{
                                    fontFamily: FONT,
                                    fontStyle: 'italic',
                                    fontWeight: 700,
                                    fontSize: 'clamp(100px,22vw,300px)',
                                    color: OFF,
                                    lineHeight: 1,
                                    letterSpacing: '-.03em',
                                    opacity: .06,
                                    userSelect: 'none',
                                    animation: 'counterTick .12s cubic-bezier(.16,1,.3,1) both',
                                }}
                            >{pct}</p>
                            <p
                                key={`v-${pct}`}
                                style={{
                                    fontFamily: FONT,
                                    fontStyle: 'italic',
                                    fontWeight: 700,
                                    fontSize: 'clamp(100px,22vw,300px)',
                                    color: OFF,
                                    lineHeight: 1,
                                    letterSpacing: '-.03em',
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    animation: 'counterTick .12s cubic-bezier(.16,1,.3,1) both',
                                }}
                            >{pct}</p>
                        </div>

                        <div style={{ width: 'clamp(200px,28vw,380px)', marginTop: 32 }}>
                            <div style={{ height: 1, background: DIM(.07), position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${RUST}, ${DIM(.45)})`, transition: 'width .09s ease' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {['—', '25', '50', '75', '100'].map(t => (
                                    <p key={t} style={{ fontFamily: SANS, fontSize: 7, color: DIM(.1), letterSpacing: '.22em', fontWeight: 300 }}>{t}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <p style={{ fontFamily: SANS, fontSize: 8, color: DIM(.1), letterSpacing: '.38em', textTransform: 'uppercase', fontWeight: 300 }}>personal diary</p>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: SANS, fontSize: 7, color: DIM(.1), letterSpacing: '.26em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 5 }}>designed & developed by</p>
                            <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 18, color: DIM(.32) }}>Mohini</p>
                        </div>
                    </div>

                </div>
            )}

            {/* ══════════════════════════════════
          ABOUT OVERLAY
      ══════════════════════════════════ */}
            {aboutOpen && (
                <div onClick={() => setAboutOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(6,5,10,.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'flex-end', animation: 'overlayIn .4s cubic-bezier(.4,0,.2,1) both' }}>
                    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '84vh', background: '#0D0B10', borderTop: `1px solid ${DIM(.07)}`, padding: 'clamp(40px,5vw,64px) clamp(36px,6vw,80px)', overflowY: 'auto', animation: 'sheetUp .55s cubic-bezier(.16,1,.3,1) both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                            <div>
                                <p style={{ fontFamily: SANS, fontSize: 9, color: RUST, letterSpacing: '.62em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 400 }}>what's inside</p>
                                <h2 style={{ fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,4vw,52px)', color: OFF, lineHeight: .96 }}>Every feature,<br />built with intention.</h2>
                            </div>
                            <button onClick={() => setAboutOpen(false)} style={{ fontFamily: SANS, fontSize: 9, color: DIM(.28), background: 'none', border: `1px solid ${DIM(.09)}`, padding: '10px 20px', cursor: 'pointer', letterSpacing: '.28em', textTransform: 'uppercase', transition: 'color .2s, border-color .2s' }} onMouseEnter={e => { e.currentTarget.style.color = OFF; e.currentTarget.style.borderColor = DIM(.28) }} onMouseLeave={e => { e.currentTarget.style.color = DIM(.28); e.currentTarget.style.borderColor = DIM(.09) }}>close ×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: '0 clamp(24px,5vw,68px)' }}>
                            {ABOUT_FEATURES.map(({ n, t, b }) => (
                                <div key={n} className="feature-row">
                                    <div style={{ display: 'flex', gap: 14 }}>
                                        <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 18, color: DIM(.08), lineHeight: 1, minWidth: 28, marginTop: 2 }}>{n}</p>
                                        <div>
                                            <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 'clamp(13px,1.2vw,16px)', color: OFF, opacity: .88, marginBottom: 5, lineHeight: 1.15 }}>{t}</p>
                                            <p style={{ fontFamily: SANS, fontSize: 11, color: DIM(.26), lineHeight: 1.88, fontWeight: 300 }}>{b}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${DIM(.06)}` }}>
                            <button className="btn-solid" style={{ fontSize: 9, padding: '12px 32px' }} onClick={() => { setAboutOpen(false); navigate('/register') }}><span>begin writing →</span></button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════
          MAIN
      ══════════════════════════════════ */}
            <div style={{ position: 'fixed', inset: 0, background: INK, overflow: 'hidden', opacity: loaderGone ? 1 : 0, transition: 'opacity .5s' }}>

                <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300, padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: loaderGone ? 'fadeIn .6s .1s both' : 'none' }}>
                    <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 20, color: OFF, opacity: .88, cursor: 'default' }}>drafts.</p>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button className="nav-about" onClick={() => setAboutOpen(true)}>about</button>
                        <button className="btn-solid" style={{ padding: '10px 26px', fontSize: 9 }} onClick={() => navigate('/register')}><span>begin →</span></button>
                    </div>
                </nav>

                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, height: 1, background: DIM(.05) }}>
                    <div style={{ height: '100%', background: RUST, width: `${progress * 100}%`, transition: 'width .04s' }} />
                </div>

                <div style={{ position: 'fixed', bottom: 26, right: 48, zIndex: 300, display: 'flex', gap: 6 }}>
                    {[0, 1].map(i => (
                        <div key={i} style={{ height: 1, width: activePanel === i ? 24 : 6, background: activePanel === i ? RUST : DIM(.15), transition: 'width .5s cubic-bezier(.16,1,.3,1), background .3s' }} />
                    ))}
                </div>

                <div style={{ position: 'fixed', bottom: 22, left: 48, zIndex: 300, display: 'flex', alignItems: 'center', gap: 10, opacity: loaderGone && progress < 0.05 ? 1 : 0, transition: 'opacity .6s' }}>
                    <div style={{ width: 24, height: 1, background: DIM(.18), transformOrigin: 'left', animation: loaderGone ? 'lineExpand 1s 1.8s cubic-bezier(.16,1,.3,1) both' : 'none' }} />
                    <p style={{ fontFamily: SANS, fontSize: 8, color: DIM(.18), letterSpacing: '.48em', textTransform: 'uppercase', fontWeight: 300, animation: loaderGone ? 'fadeIn .7s 1.9s both' : 'none' }}>scroll</p>
                </div>

                <div ref={trackRef} style={{ display: 'flex', height: '100vh', willChange: 'transform', position: 'absolute', top: 0, left: 0 }}>

                    {/* ════ PANEL 1 ════ */}
                    <div style={{ width: '100vw', height: '100vh', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>

                        <img src={skullImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 15%', display: 'block', filter: 'brightness(.36) contrast(1.1) saturate(0)', animation: loaderGone ? 'imgScale 2s .05s cubic-bezier(.4,0,.2,1) both' : 'none' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,5,10,.5) 0%, rgba(6,5,10,.06) 38%, rgba(6,5,10,.92) 100%)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,5,10,.78) 0%, rgba(6,5,10,.16) 55%, rgba(6,5,10,.06) 100%)' }} />
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.03'/%3E%3C/svg%3E")`, backgroundSize: '380px 380px', mixBlendMode: 'overlay', pointerEvents: 'none' }} />

                        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(48px,7vw,88px) 48px 0' }}>

                            <div style={{ overflow: 'hidden', marginBottom: 'clamp(12px,1.8vw,20px)' }}>
                                <p style={{ fontFamily: SANS, fontSize: 9, color: RUST, letterSpacing: '.72em', textTransform: 'uppercase', fontWeight: 400, animation: loaderGone ? 'wordRise .9s .1s cubic-bezier(.16,1,.3,1) both' : 'none' }}>personal diary — est. 2025</p>
                            </div>

                            <div style={{ overflow: 'hidden', marginBottom: 8 }}>
                                <h1 style={{ fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(52px,9.5vw,138px)', color: OFF, lineHeight: .88, letterSpacing: '-.018em', animation: loaderGone ? 'wordRise 1.3s .2s cubic-bezier(.16,1,.3,1) both' : 'none' }}>Never meant</h1>
                            </div>
                            <div style={{ overflow: 'hidden', marginBottom: 'clamp(18px,2.8vw,32px)' }}>
                                <h1 style={{ fontFamily: FONT, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(52px,9.5vw,138px)', color: 'transparent', WebkitTextStroke: `1.5px ${DIM(.24)}`, lineHeight: .88, letterSpacing: '-.018em', paddingLeft: 'clamp(40px,6vw,80px)', animation: loaderGone ? 'wordRise 1.3s .34s cubic-bezier(.16,1,.3,1) both' : 'none' }}>to be sent.</h1>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 'clamp(22px,3.2vw,36px)', animation: loaderGone ? 'fadeUp .9s .9s both' : 'none' }}>
                                <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 'clamp(13px,1.1vw,16px)', color: DIM(.26), lineHeight: 2.1, maxWidth: 260, fontWeight: 400 }}>
                                    The words you wrote<br />but never gave anyone.<br />Keep them here. Keep them forever.
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-solid" onClick={() => navigate('/register')}><span>begin writing</span></button>
                                    <button className="btn-ghost" onClick={() => navigate('/login')}><span>open diary</span></button>
                                </div>
                            </div>

                            <div style={{ overflow: 'hidden', animation: loaderGone ? 'fadeIn .8s 1.1s both' : 'none' }}>
                                <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'driftLeft 22s linear infinite' }}>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <span key={i} style={{ fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(88px,17vw,232px)', color: 'transparent', WebkitTextStroke: `1px ${DIM(.065)}`, lineHeight: .82, letterSpacing: '-.018em', paddingRight: '0.3em', userSelect: 'none' }}>drafts.</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 200, background: `linear-gradient(90deg,transparent,${INK})`, pointerEvents: 'none', zIndex: 3 }} />
                    </div>

                    {/* ════ PANEL 2 ════ */}
                    <div style={{ width: '100vw', height: '100vh', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>

                        {/* full-bleed image — left ~55%, fades into black on all sides */}
                        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                            <img
                                src={handImg} alt=""
                                style={{ position: 'absolute', top: 0, right: 0, width: '58%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block', filter: 'brightness(.42) contrast(1.08) saturate(0)' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,5,10,.7) 0%, rgba(6,5,10,.1) 22%, rgba(6,5,10,.1) 72%, rgba(6,5,10,.85) 100%)' }} />
                            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${INK} 28%, rgba(6,5,10,.82) 42%, rgba(6,5,10,.35) 62%, rgba(6,5,10,.1) 100%)` }} />
                        </div>

                        {/* text layer — sits on top of image */}
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(80px,10vw,116px) 48px 0 48px', height: '100%', overflow: 'hidden' }}>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ fontFamily: SANS, fontSize: 9, color: RUST, letterSpacing: '.7em', textTransform: 'uppercase', fontWeight: 400, marginBottom: 'clamp(20px,3vw,30px)' }}>your diary</p>

                                {[
                                    { text: 'Your words.', weight: 700, stroke: false, strokeOpacity: 1 },
                                    { text: 'Your handwriting.', weight: 400, stroke: true, strokeOpacity: .32 },
                                    { text: 'Your secret.', weight: 400, stroke: true, strokeOpacity: .12 },
                                ].map(({ text, weight, stroke, strokeOpacity }) => (
                                    <div key={text} style={{ marginBottom: 'clamp(4px,0.6vw,8px)', padding: '2px 0' }}>
                                        <h2 style={{
                                            fontFamily: FONT,
                                            fontStyle: 'italic',
                                            fontWeight: weight,
                                            fontSize: 'clamp(34px,5.8vw,82px)',
                                            color: stroke ? 'transparent' : OFF,
                                            WebkitTextStroke: stroke ? `1.2px ${DIM(strokeOpacity)}` : 'none',
                                            lineHeight: .95,
                                            letterSpacing: '-.018em',
                                            display: 'block',
                                        }}>{text}</h2>
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: 40, marginTop: 'clamp(22px,3.2vw,38px)', paddingTop: 18, borderTop: `1px solid ${DIM(.07)}` }}>
                                    {[{ n: '∞', l: 'pages' }, { n: '6', l: 'covers' }, { n: '0', l: 'ads' }, { n: '8', l: 'features' }].map(({ n, l }) => (
                                        <div key={l} className="stat-card">
                                            <p style={{ fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(17px,2.2vw,28px)', color: RUST, lineHeight: 1 }}>{n}</p>
                                            <p style={{ fontFamily: SANS, fontSize: 7, color: DIM(.12), letterSpacing: '.44em', textTransform: 'uppercase', marginTop: 5, fontWeight: 300 }}>{l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, paddingTop: 18, borderTop: `1px solid ${DIM(.06)}` }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-solid" style={{ padding: '12px 28px', fontSize: 9 }} onClick={() => navigate('/register')}><span>begin writing</span></button>
                                        <button className="btn-ghost" style={{ padding: '12px 28px', fontSize: 9 }} onClick={() => navigate('/login')}><span>open diary</span></button>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontFamily: SANS, fontSize: 7, color: DIM(.22), letterSpacing: '.24em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 4 }}>designed & developed by</p>
                                        <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 17, color: DIM(.55) }}>Mohini</p>
                                    </div>
                                    <p style={{ fontFamily: SANS, fontSize: 7, color: DIM(.18), letterSpacing: '.32em', textTransform: 'uppercase', fontWeight: 300 }}>© {new Date().getFullYear()} drafts.</p>
                                </div>

                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'driftLeft 18s linear infinite' }}>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <span key={i} style={{ fontFamily: FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(86px,16.5vw,214px)', color: 'transparent', WebkitTextStroke: `1px ${DIM(.05)}`, lineHeight: .8, letterSpacing: '-.018em', paddingRight: '0.3em', userSelect: 'none' }}>drafts.</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}