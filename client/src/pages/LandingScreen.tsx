import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import skullStamp from '../assets/11.png'
import temple from '../assets/22.jpeg'
import hands from '../assets/44.jpeg'
import script from '../assets/55.jpeg'
import eyes from '../assets/66.jpeg'

const P = '#EDE4D0'
const C = '#F8F4EB'
const INK = '#1A0F06'
const INK2 = '#251508'
const T = '#A8441F'
const T2 = '#7A2E10'
const MID = 'rgba(26,15,6,0.4)'
const F = 'rgba(26,15,6,0.06)'

export default function LandingScreen() {
    const navigate = useNavigate()
    const [mounted, setMounted] = useState(false)
    const [hov, setHov] = useState(false)
    const [vis, setVis] = useState<Set<string>>(new Set())
    const containerRef = useRef<HTMLDivElement>(null)
    const dotRef = useRef<HTMLDivElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)
    const rp = useRef({ x: -100, y: -100 })
    const raf = useRef(0)
    const sRefs = useRef<Map<string, HTMLElement>>(new Map())

    useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (dotRef.current) { dotRef.current.style.left = e.clientX + 'px'; dotRef.current.style.top = e.clientY + 'px' }
        }
        window.addEventListener('mousemove', fn)
        return () => window.removeEventListener('mousemove', fn)
    }, [])

    useEffect(() => {
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const tick = () => {
            if (dotRef.current) {
                rp.current.x = lerp(rp.current.x, parseFloat(dotRef.current.style.left) || 0, 0.08)
                rp.current.y = lerp(rp.current.y, parseFloat(dotRef.current.style.top) || 0, 0.08)
            }
            if (ringRef.current) { ringRef.current.style.left = rp.current.x + 'px'; ringRef.current.style.top = rp.current.y + 'px' }
            raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf.current)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) setVis(prev => new Set([...prev, e.target.getAttribute('data-s') || ''])) })
        }, { threshold: 0.08 })
        sRefs.current.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [mounted])

    const sr = useCallback((id: string) => (el: HTMLElement | null) => { if (el) sRefs.current.set(id, el) }, [])
    const v = (id: string) => vis.has(id)
    const on = () => setHov(true)
    const off = () => setHov(false)

    const covers = [
        { name: 'Memento Mori', sub: 'full grain leather', bg: 'linear-gradient(160deg,#1a0c04 0%,#0d0602 100%)', spine: 'linear-gradient(180deg,#3a1a08,#1a0c04)', ac: 'rgba(194,148,72,0.85)', tex: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px)' },
        { name: 'Elegy', sub: 'aged vellum', bg: 'linear-gradient(160deg,#2a2018 0%,#16100a 100%)', spine: 'linear-gradient(180deg,#4a3828,#2a2018)', ac: 'rgba(220,200,165,0.7)', tex: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 6px)' },
        { name: 'Fever Dreams', sub: 'scarlet morocco', bg: 'linear-gradient(160deg,#2a0606 0%,#120202 100%)', spine: 'linear-gradient(180deg,#4a0a0a,#2a0606)', ac: 'rgba(200,50,50,0.75)', tex: 'repeating-linear-gradient(135deg,rgba(255,255,255,0.01) 0px,rgba(255,255,255,0.01) 1px,transparent 1px,transparent 7px)' },
        { name: 'Séance', sub: 'midnight cloth', bg: 'linear-gradient(160deg,#0a0a12 0%,#050508 100%)', spine: 'linear-gradient(180deg,#141420,#0a0a12)', ac: 'rgba(130,110,200,0.7)', tex: 'radial-gradient(circle at 50% 50%,rgba(130,110,200,0.04) 0%,transparent 60%)' },
        { name: 'The Longest Summer', sub: 'raw linen', bg: 'linear-gradient(160deg,#1e1a0e 0%,#100e06 100%)', spine: 'linear-gradient(180deg,#3a3218,#1e1a0e)', ac: 'rgba(180,155,80,0.72)', tex: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.014) 0px,rgba(255,255,255,0.014) 1px,transparent 1px,transparent 9px)' },
        { name: 'Haunt', sub: 'bone paper', bg: 'linear-gradient(160deg,#1c1814 0%,#0e0c08 100%)', spine: 'linear-gradient(180deg,#342e26,#1c1814)', ac: 'rgba(230,220,200,0.45)', tex: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.01) 0px,rgba(255,255,255,0.01) 1px,transparent 1px,transparent 5px)' },
    ]

    const mq = ['drafts.', 'your words', 'never sent', 'written tonight', 'my dearest,', 'keep it', 'lock it away', 'just you']

    return (
        <div ref={containerRef} style={{ overflowY: 'scroll', background: INK, cursor: 'none', fontFamily: 'serif', position: 'relative' }}>

            <div ref={dotRef} style={{ position: 'fixed', width: hov ? 11 : 7, height: hov ? 11 : 7, background: hov ? T : P, borderRadius: '50%', pointerEvents: 'none', zIndex: 999999, transform: 'translate(-50%,-50%)', transition: 'width 0.2s,height 0.2s,background 0.2s', willChange: 'left,top' }} />
            <div ref={ringRef} style={{ position: 'fixed', width: hov ? 56 : 38, height: hov ? 56 : 38, border: hov ? `1.5px solid ${T}` : `1px solid rgba(232,220,200,0.28)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 999998, transform: 'translate(-50%,-50%)', transition: 'width 0.35s,height 0.35s,border 0.3s', willChange: 'left,top' }} />

            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, padding: '18px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.5s', background: 'rgba(20,10,4,0.82)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(232,220,200,0.06)' }}>
                <p style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 22, color: P, margin: 0, letterSpacing: 0.5, opacity: 0.9 }}>drafts.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {['about', 'diaries'].map(t => (
                        <span key={t} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 10, color: 'rgba(232,220,200,0.35)', letterSpacing: '0.48em', textTransform: 'uppercase', cursor: 'none', transition: 'color 0.3s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = P; on() }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(232,220,200,0.35)'; off() }}>{t}</span>
                    ))}
                    <button onClick={() => navigate('/register')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: INK, background: P, border: 'none', padding: '11px 26px', cursor: 'none', transition: 'all 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T; e.currentTarget.style.color = P; on() }}
                        onMouseLeave={e => { e.currentTarget.style.background = P; e.currentTarget.style.color = INK; off() }}>begin →</button>
                </div>
            </nav>

            <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={temple} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(0.38) saturate(0.7) sepia(0.3)', display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,10,4,0.3) 0%, rgba(20,10,4,0.15) 40%, rgba(20,10,4,0.7) 85%, rgba(20,10,4,1) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(168,68,31,0.07) 0%, transparent 65%)', pointerEvents: 'none', animation: 'breathe 8s ease-in-out infinite' }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 clamp(24px,5vw,80px)', opacity: mounted ? 1 : 0, transition: 'opacity 1.6s 0.3s' }}>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 10, color: T, letterSpacing: '0.7em', textTransform: 'uppercase', margin: '0 0 28px', opacity: 0.9 }}>personal diary</p>
                    <h1 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(52px,11vw,160px)', fontWeight: 400, color: P, margin: '0 0 10px', lineHeight: 0.88, letterSpacing: '-0.02em', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(60px)', transition: 'all 1.8s 0.4s cubic-bezier(0.16,1,0.3,1)', textShadow: '0 4px 60px rgba(168,68,31,0.25)' }}>never meant</h1>
                    <h1 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(52px,11vw,160px)', fontWeight: 400, color: 'transparent', WebkitTextStroke: `1.5px rgba(237,228,208,0.55)`, margin: '0 0 44px', lineHeight: 0.88, letterSpacing: '-0.02em', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(60px)', transition: 'all 1.8s 0.55s cubic-bezier(0.16,1,0.3,1)' }}>to be sent.</h1>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 'clamp(14px,1.4vw,18px)', color: 'rgba(237,228,208,0.5)', maxWidth: 440, margin: '0 auto 44px', lineHeight: 1.9, opacity: mounted ? 1 : 0, transition: 'opacity 2s 1s' }}>The words you wrote but never gave anyone. Write them here. Lock them away. Keep them forever.</p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', opacity: mounted ? 1 : 0, transition: 'opacity 1.5s 1.3s' }}>
                        <button onClick={() => navigate('/register')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: INK, background: P, border: 'none', padding: '16px 48px', cursor: 'none', transition: 'all 0.35s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = T; e.currentTarget.style.color = P; on() }}
                            onMouseLeave={e => { e.currentTarget.style.background = P; e.currentTarget.style.color = INK; off() }}>begin writing</button>
                        <button onClick={() => navigate('/login')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: P, background: 'transparent', border: '1px solid rgba(237,228,208,0.22)', padding: '16px 48px', cursor: 'none', transition: 'all 0.35s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(237,228,208,0.6)'; on() }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(237,228,208,0.22)'; off() }}>open diary</button>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', opacity: mounted ? 0.4 : 0, transition: 'opacity 1s 2s', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'scrollBounce 2.8s ease-in-out infinite' }}>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 8, color: P, letterSpacing: '0.7em', textTransform: 'uppercase', margin: 0 }}>scroll</p>
                    <div style={{ width: 1, height: 40, background: `linear-gradient(180deg,${P},transparent)` }} />
                </div>
            </section>

            <div style={{ background: INK2, borderTop: '1px solid rgba(237,228,208,0.05)', overflow: 'hidden', padding: '16px 0' }}>
                <div style={{ display: 'flex', animation: 'marquee 24s linear infinite', whiteSpace: 'nowrap' }}>
                    {[...mq, ...mq, ...mq].map((t, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 24, paddingRight: 24 }}>
                            <span style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 16, color: 'rgba(237,228,208,0.45)', letterSpacing: '0.08em' }}>{t}</span>
                            <span style={{ color: T, fontSize: 10, opacity: 0.7 }}>✦</span>
                        </span>
                    ))}
                </div>
            </div>

            <section ref={sr('about')} data-s="about" style={{ position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '90vh' }}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={hands} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.55) saturate(0.75) sepia(0.2)', display: 'block', transform: v('about') ? 'scale(1.0)' : 'scale(1.06)', transition: 'transform 2s ease' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 50%, rgba(26,15,6,1) 100%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,15,6,0.4) 0%, transparent 30%, rgba(26,15,6,0.3) 100%)', pointerEvents: 'none' }} />
                </div>
                <div style={{ background: INK2, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(52px,7vw,110px) clamp(36px,5vw,80px)', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 80% 50%, rgba(168,68,31,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: T, letterSpacing: '0.6em', textTransform: 'uppercase', margin: '0 0 22px', opacity: v('about') ? 1 : 0, transition: 'opacity 0.9s 0.1s' }}>what is drafts.</p>
                    <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(34px,4.5vw,66px)', color: P, margin: '0 0 28px', fontWeight: 400, lineHeight: 1.05, opacity: v('about') ? 1 : 0, transform: v('about') ? 'translateY(0)' : 'translateY(50px)', transition: 'all 1.2s 0.2s cubic-bezier(0.16,1,0.3,1)' }}>The letters you wrote but never sent.</h2>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 'clamp(13px,1.3vw,16px)', color: 'rgba(237,228,208,0.5)', lineHeight: 1.95, margin: '0 0 18px', opacity: v('about') ? 1 : 0, transition: 'opacity 1.1s 0.4s' }}>The rage you swallowed. The love you never said out loud. The 3am spirals nobody asked to read — but needed to be written.</p>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 'clamp(13px,1.3vw,16px)', color: 'rgba(237,228,208,0.22)', lineHeight: 1.9, margin: '0 0 44px', opacity: v('about') ? 1 : 0, transition: 'opacity 1.1s 0.55s' }}>No audience. No algorithm. No send button.</p>
                    <div style={{ display: 'flex', gap: 44, opacity: v('about') ? 1 : 0, transition: 'opacity 1s 0.7s' }}>
                        {[{ n: '∞', l: 'pages' }, { n: '6', l: 'diaries' }, { n: '5', l: 'tools' }].map(({ n, l }) => (
                            <div key={l}>
                                <p style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(36px,4.5vw,58px)', color: T, margin: '0 0 5px', lineHeight: 1 }}>{n}</p>
                                <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: 'rgba(237,228,208,0.3)', letterSpacing: '0.45em', textTransform: 'uppercase', margin: 0 }}>{l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section ref={sr('script')} data-s="script" style={{ position: 'relative', overflow: 'hidden', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={script} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.28) saturate(0.5) sepia(0.4)', display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(26,15,6,0.85) 0%, rgba(26,15,6,0.4) 50%, rgba(26,15,6,0.85) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,15,6,0.6) 0%, transparent 40%, rgba(26,15,6,0.6) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(60px,9vw,130px) clamp(28px,6vw,90px)', maxWidth: 820, opacity: v('script') ? 1 : 0, transform: v('script') ? 'translateY(0)' : 'translateY(50px)', transition: 'all 1.3s 0.15s cubic-bezier(0.16,1,0.3,1)' }}>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: T, letterSpacing: '0.6em', textTransform: 'uppercase', margin: '0 0 24px', opacity: 0.9 }}>the feeling</p>
                    <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(38px,6vw,88px)', color: P, margin: '0 0 28px', fontWeight: 400, lineHeight: 0.95, textShadow: '0 2px 40px rgba(168,68,31,0.2)' }}>"Some things are<br />meant to be kept,<br />not sent."</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 32, height: 1, background: T, opacity: 0.8 }} />
                        <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 12, color: 'rgba(237,228,208,0.38)', margin: 0, letterSpacing: '0.2em' }}>never meant to be sent.</p>
                    </div>
                </div>
            </section>

            <section ref={sr('features')} data-s="features" style={{ background: INK, padding: 'clamp(80px,10vw,140px) clamp(28px,6vw,90px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(168,68,31,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(44px,6vw,80px)', opacity: v('features') ? 1 : 0, transform: v('features') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s 0.1s ease' }}>
                        <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(34px,5.5vw,82px)', color: P, margin: 0, fontWeight: 400, lineHeight: 0.92 }}>Everything a diary<br />should be.</h2>
                        <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: 'rgba(237,228,208,0.22)', letterSpacing: '0.55em', textTransform: 'uppercase', margin: 0, paddingBottom: 6 }}>features</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1 }}>
                        {[
                            { n: '01', t: 'Draw freely.', b: 'Every page is a canvas. Pen, pencil, highlighter, eraser. Sketch, annotate, scribble it all out.', d: 0.15 },
                            { n: '02', t: 'Lock it tight.', b: "Password-protect any diary. Not for anyone else's eyes. Not for tomorrow's regret.", d: 0.28 },
                            { n: '03', t: 'Keep forever.', b: 'Every entry persists. Every thought archived. Nothing disappears unless you say so.', d: 0.4 },
                        ].map(({ n, t, b, d }) => (
                            <div key={n} style={{ padding: 'clamp(30px,4vw,54px)', background: 'rgba(237,228,208,0.025)', borderTop: '1px solid rgba(237,228,208,0.06)', position: 'relative', overflow: 'hidden', opacity: v('features') ? 1 : 0, transform: v('features') ? 'translateY(0)' : 'translateY(60px)', transition: `all 1.1s ${d}s cubic-bezier(0.16,1,0.3,1)`, cursor: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(237,228,208,0.048)'; on() }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(237,228,208,0.025)'; off() }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: T, opacity: 0.65 }} />
                                <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: T, letterSpacing: '0.55em', textTransform: 'uppercase', margin: '0 0 18px', opacity: 0.85 }}>{n}</p>
                                <h3 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(26px,3vw,46px)', color: P, margin: '0 0 16px', fontWeight: 400, lineHeight: 1.05 }}>{t}</h3>
                                <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 13, color: 'rgba(237,228,208,0.38)', lineHeight: 1.85, margin: 0 }}>{b}</p>
                                <p style={{ position: 'absolute', bottom: -12, right: 12, fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(70px,10vw,130px)', color: 'transparent', WebkitTextStroke: '1px rgba(237,228,208,0.035)', margin: 0, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{n}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section ref={sr('eyes')} data-s="eyes" style={{ position: 'relative', overflow: 'hidden', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={eyes} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(0.32) saturate(0.6) sepia(0.35)', display: 'block', transform: v('eyes') ? 'scale(1.0)' : 'scale(1.08)', transition: 'transform 2.5s ease' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(26,15,6,0.92) 0%, rgba(26,15,6,0.3) 60%, rgba(26,15,6,0.6) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,15,6,0.5) 0%, transparent 50%, rgba(26,15,6,0.5) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(60px,9vw,130px) clamp(28px,6vw,90px)', maxWidth: 600, marginRight: 0, opacity: v('eyes') ? 1 : 0, transform: v('eyes') ? 'translateX(0)' : 'translateX(60px)', transition: 'all 1.4s 0.2s cubic-bezier(0.16,1,0.3,1)', textAlign: 'right' }}>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: T, letterSpacing: '0.6em', textTransform: 'uppercase', margin: '0 0 22px', opacity: 0.9 }}>your secret</p>
                    <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(32px,4.5vw,66px)', color: P, margin: '0 0 22px', fontWeight: 400, lineHeight: 1.05 }}>The only eyes<br />that see this<br />are yours.</h2>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 'clamp(13px,1.3vw,16px)', color: 'rgba(237,228,208,0.4)', lineHeight: 1.9, margin: 0 }}>Every diary can be locked with a password. No one else gets in. Not even us.</p>
                </div>
            </section>

            <div style={{ background: INK2, borderTop: '1px solid rgba(237,228,208,0.04)', borderBottom: '1px solid rgba(237,228,208,0.04)', overflow: 'hidden', padding: '15px 0' }}>
                <div style={{ display: 'flex', animation: 'marqueeRev 28s linear infinite', whiteSpace: 'nowrap' }}>
                    {['memento mori', 'elegy', 'fever dreams', 'séance', 'the longest summer', 'haunt', 'full grain leather', 'aged vellum', 'scarlet morocco', 'midnight cloth', 'raw linen', 'bone paper'].flatMap((t, i, a) => [
                        <span key={i} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 10, color: 'rgba(237,228,208,0.28)', letterSpacing: '0.45em', textTransform: 'uppercase', marginRight: 22 }}>{t}</span>,
                        <span key={i + a.length} style={{ color: T, fontSize: 9, opacity: 0.5, marginRight: 22 }}>◆</span>
                    ])}
                </div>
            </div>

            <section ref={sr('covers')} data-s="covers" style={{ background: INK2, padding: 'clamp(80px,10vw,140px) clamp(28px,6vw,90px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 20% 60%, rgba(168,68,31,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ marginBottom: 'clamp(44px,6vw,80px)', opacity: v('covers') ? 1 : 0, transform: v('covers') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s 0.1s ease' }}>
                        <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: T, letterSpacing: '0.6em', textTransform: 'uppercase', margin: '0 0 18px' }}>choose your diary</p>
                        <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(34px,5.5vw,82px)', color: P, margin: 0, fontWeight: 400, lineHeight: 0.92 }}>Six diaries.<br />Six worlds.</h2>
                    </div>
                    <div style={{ display: 'flex', gap: 12, opacity: v('covers') ? 1 : 0, transform: v('covers') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1.1s 0.3s ease' }}>
                        {covers.map(({ name, sub, bg, spine, ac, tex }) => (
                            <div key={name} style={{ flex: 1, aspectRatio: '2/3', background: bg, position: 'relative', overflow: 'hidden', transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)', cursor: 'none', borderRadius: 1 }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-16px) scale(1.04)'; e.currentTarget.style.boxShadow = `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${ac}`; on() }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; off() }}>
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: tex, pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, background: spine, pointerEvents: 'none', boxShadow: '2px 0 8px rgba(0,0,0,0.4)' }} />
                                <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 3, background: 'linear-gradient(90deg,rgba(255,255,255,0.06),transparent)', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', inset: '12px 12px 12px 22px', border: `1px solid ${ac}`, opacity: 0.14, pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', inset: '16px 16px 16px 26px', border: `1px solid ${ac}`, opacity: 0.07, pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', top: '50%', left: '55%', transform: 'translate(-50%,-55%)', textAlign: 'center', width: '75%' }}>
                                    <p style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(11px,1.3vw,16px)', color: ac, margin: '0 0 6px', letterSpacing: 0.5, opacity: 0.85, lineHeight: 1.3 }}>{name}</p>
                                    <div style={{ width: 20, height: 1, background: ac, opacity: 0.4, margin: '0 auto 6px' }} />
                                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 7, color: ac, letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.45, margin: 0 }}>{sub}</p>
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: ac, opacity: 0.6 }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 40%)', pointerEvents: 'none' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section ref={sr('cta')} data-s="cta" style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={temple} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', filter: 'brightness(0.22) saturate(0.5) sepia(0.4)', display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,15,6,0.85) 0%, rgba(26,15,6,0.5) 50%, rgba(26,15,6,0.9) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '70vw', height: '70vw', borderRadius: '50%', border: '1px solid rgba(168,68,31,0.08)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'slowSpin 90s linear infinite' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '46vw', height: '46vw', borderRadius: '50%', border: '1px solid rgba(168,68,31,0.06)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'slowSpin 60s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(168,68,31,0.1) 0%, transparent 65%)', pointerEvents: 'none', animation: 'breathe 10s ease-in-out infinite' }} />
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 860, padding: '0 clamp(24px,5vw,80px)', opacity: v('cta') ? 1 : 0, transform: v('cta') ? 'translateY(0)' : 'translateY(50px)', transition: 'all 1.3s 0.15s cubic-bezier(0.16,1,0.3,1)' }}>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: T, letterSpacing: '0.7em', textTransform: 'uppercase', margin: '0 0 28px', opacity: 0.9 }}>begin tonight</p>
                    <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(48px,9vw,128px)', color: P, margin: '0 0 10px', fontWeight: 400, lineHeight: 0.88, textShadow: '0 4px 60px rgba(168,68,31,0.22)' }}>Write it down.</h2>
                    <h2 style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 'clamp(48px,9vw,128px)', color: 'transparent', WebkitTextStroke: `1.8px ${T}`, margin: '0 0 44px', fontWeight: 400, lineHeight: 0.88 }}>Keep it forever.</h2>
                    <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 'clamp(13px,1.4vw,18px)', color: 'rgba(237,228,208,0.4)', maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.9 }}>Some things are meant to be written, not sent. This is that place.</p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/register')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: INK, background: P, border: 'none', padding: '17px 52px', cursor: 'none', transition: 'all 0.35s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = T; e.currentTarget.style.color = P; on() }}
                            onMouseLeave={e => { e.currentTarget.style.background = P; e.currentTarget.style.color = INK; off() }}>begin writing</button>
                        <button onClick={() => navigate('/login')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: P, background: 'transparent', border: '1px solid rgba(237,228,208,0.22)', padding: '17px 52px', cursor: 'none', transition: 'all 0.35s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(237,228,208,0.6)'; on() }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(237,228,208,0.22)'; off() }}>open diary</button>
                    </div>
                </div>
            </section>

            <footer style={{ background: INK, borderTop: '1px solid rgba(237,228,208,0.05)', padding: 'clamp(48px,6vw,82px) clamp(28px,6vw,90px)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid rgba(237,228,208,0.06)', paddingBottom: 40, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                        <p style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 48, color: P, margin: 0, opacity: 0.75 }}>drafts.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => navigate('/register')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: INK, background: P, border: 'none', padding: '13px 32px', cursor: 'none', transition: 'all 0.3s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = T; e.currentTarget.style.color = P; on() }}
                                onMouseLeave={e => { e.currentTarget.style.background = P; e.currentTarget.style.color = INK; off() }}>begin writing</button>
                            <button onClick={() => navigate('/login')} style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: P, background: 'transparent', border: '1px solid rgba(237,228,208,0.2)', padding: '13px 32px', cursor: 'none', transition: 'all 0.3s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(237,228,208,0.5)'; on() }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(237,228,208,0.2)'; off() }}>open diary</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                        <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: 'rgba(237,228,208,0.15)', margin: 0, letterSpacing: '0.4em', textTransform: 'uppercase' }}>personal diary — 2025</p>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontStyle: 'italic', fontSize: 11, color: 'rgba(237,228,208,0.24)', margin: '0 0 5px', letterSpacing: '0.15em' }}>designed & developed by</p>
                            <p style={{ fontFamily: "'IM Fell English',Georgia,serif", fontStyle: 'italic', fontSize: 21, color: 'rgba(237,228,208,0.6)', margin: 0, letterSpacing: 1 }}>Mohini</p>
                        </div>
                        <p style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontSize: 9, color: 'rgba(237,228,208,0.1)', margin: 0, letterSpacing: '0.35em', textTransform: 'uppercase' }}>© {new Date().getFullYear()} drafts. all rights reserved</p>
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');
                @keyframes marquee      { from{transform:translateX(0)} to{transform:translateX(-50%)} }
                @keyframes marqueeRev   { from{transform:translateX(-50%)} to{transform:translateX(0)} }
                @keyframes slowSpin     { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
                @keyframes breathe      { 0%,100%{opacity:0.7} 50%{opacity:1} }
                @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(10px)} }
                * { box-sizing:border-box; }
            `}</style>
        </div>
    )
}