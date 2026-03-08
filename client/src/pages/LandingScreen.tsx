import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import skullStamp from '../assets/11.png'
import moon from '../assets/33.png'

export default function LandingScreen() {
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })
    const magnetRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number>(0)
    const inkCountRef = useRef(0)
    const [mounted, setMounted] = useState(false)
    const [section, setSection] = useState(0)
    const [inkLines, setInkLines] = useState<{ id: number; x: number; y: number; angle: number; len: number }[]>([])

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        const c = containerRef.current
        if (!c) return
        const onScroll = () => setSection(Math.round(c.scrollTop / c.clientHeight))
        c.addEventListener('scroll', onScroll, { passive: true })
        return () => c.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
            if (magnetRef.current) {
                const rect = magnetRef.current.getBoundingClientRect()
                const cx = rect.left + rect.width / 2
                const cy = rect.top + rect.height / 2
                const dx = e.clientX - cx
                const dy = e.clientY - cy
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 280) {
                    const s = (1 - dist / 280) * 0.36
                    magnetRef.current.style.transform = `translate(${dx * s}px,${dy * s}px)`
                } else {
                    magnetRef.current.style.transform = 'translate(0px,0px)'
                }
            }
            if (Math.random() > 0.85) {
                inkCountRef.current++
                const id = inkCountRef.current
                setInkLines(prev => [...prev.slice(-16), { id, x: e.clientX, y: e.clientY, angle: Math.random() * 360, len: 20 + Math.random() * 48 }])
                setTimeout(() => setInkLines(prev => prev.filter(l => l.id !== id)), 900)
            }
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)
        const pts: { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number }[] = []
        let frame = 0
        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            frame++
            if (frame % 9 === 0 && pts.length < 60) {
                pts.push({ x: Math.random() * canvas.width, y: canvas.height + 8, vx: (Math.random() - 0.5) * 0.35, vy: -(0.12 + Math.random() * 0.45), life: 0, max: 200 + Math.random() * 260, r: 0.4 + Math.random() * 1.4 })
            }
            for (let i = pts.length - 1; i >= 0; i--) {
                const p = pts[i]
                p.life++; p.x += p.vx + Math.sin(p.life * 0.018) * 0.22; p.y += p.vy
                if (p.life >= p.max) { pts.splice(i, 1); continue }
                const pr = p.life / p.max
                const a = pr < 0.18 ? pr / 0.18 : pr > 0.75 ? 1 - (pr - 0.75) / 0.25 : 1
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(200,160,90,${a * 0.28})`; ctx.fill()
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current) }
    }, [])

    const ghostPhrases = ['your words.', 'your world.', 'your secrets.', 'your drafts.', 'never sent.']

    return (
        <div ref={containerRef} style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', background: '#04030a', cursor: 'none' }}>

            <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            {inkLines.map(l => (
                <div key={l.id} style={{ position: 'fixed', left: l.x, top: l.y, width: l.len, height: 1.2, background: 'linear-gradient(90deg, rgba(200,160,90,0.7), transparent)', transform: `rotate(${l.angle}deg)`, transformOrigin: '0 50%', pointerEvents: 'none', zIndex: 99998, animation: 'inkFade 0.9s ease forwards' }} />
            ))}

            <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.038, pointerEvents: 'none', zIndex: 1, mixBlendMode: 'overlay' }} />

            <div style={{ position: 'fixed', top: 36, right: 42, zIndex: 99, display: 'flex', gap: 6, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 2s ease' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} onClick={() => containerRef.current?.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' })} style={{ width: section === i ? 20 : 5, height: 5, borderRadius: 3, background: section === i ? 'rgba(200,160,90,0.7)' : 'rgba(200,160,90,0.15)', transition: 'all 0.4s ease', cursor: 'none' }} />
                ))}
            </div>

            {/* SECTION 1 */}
            <section style={{ scrollSnapAlign: 'start', height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 80% at 15% 55%, rgba(160,100,30,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 20%, rgba(80,55,180,0.14) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 0, opacity: mounted ? 1 : 0, transition: 'opacity 3s ease' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,160,90,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,90,0.025) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none', zIndex: 0, opacity: mounted ? 1 : 0, transition: 'opacity 2.5s 0.5s ease' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(200,160,90,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, opacity: mounted ? 0.6 : 0, transition: 'opacity 3s 0.8s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(200,160,90,0.04) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0, opacity: mounted ? 1 : 0, transition: 'opacity 3s 1s ease', animation: mounted ? 'breathe 8s ease-in-out infinite' : 'none' }} />

                <img src={moon} alt="" style={{ position: 'absolute', left: '-28vw', top: '50%', transform: mounted ? 'translate(0,-50%)' : 'translate(-200px,-50%)', width: '72vw', height: '72vw', objectFit: 'contain', opacity: mounted ? 0.55 : 0, transition: 'transform 2.2s 0.1s cubic-bezier(0.16,1,0.3,1), opacity 1.8s 0.1s ease', zIndex: 1, pointerEvents: 'none', filter: 'brightness(0.65) contrast(1.35) saturate(0.4) sepia(0.3)', mixBlendMode: 'luminosity' }} />

                <div style={{ position: 'absolute', left: 0, top: 0, width: '38vw', height: '100%', background: 'linear-gradient(90deg, rgba(4,3,10,0.98) 0%, rgba(4,3,10,0.6) 55%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40vh', background: 'linear-gradient(0deg, rgba(4,3,10,0.95) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22vh', background: 'linear-gradient(180deg, rgba(4,3,10,0.85) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />

                <div ref={magnetRef} style={{ position: 'absolute', top: '6%', right: '5%', zIndex: 4, opacity: mounted ? 1 : 0, transition: 'opacity 1s 0.6s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, willChange: 'transform' }}>
                    <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse, rgba(200,160,90,0.1) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', animation: 'stampAura 7s ease-in-out infinite' }} />
                    <img src={skullStamp} alt="" style={{ width: 300, height: 300, objectFit: 'contain', filter: 'sepia(0.6) brightness(0.7) contrast(1.4) saturate(0.5)', opacity: 0.88, animation: mounted ? 'floatStamp 10s ease-in-out infinite' : 'none', willChange: 'transform' }} />
                    <p style={{ fontFamily: "'Palatino Linotype', Palatino, serif", fontStyle: 'italic', fontSize: 12, color: 'rgba(200,160,90,0.65)', letterSpacing: '0.35em', margin: 0, whiteSpace: 'nowrap', textTransform: 'uppercase', textShadow: '0 0 20px rgba(200,160,90,0.3)' }}>written in the dark.</p>
                </div>

                <div onClick={() => containerRef.current?.scrollTo({ top: containerRef.current.clientHeight, behavior: 'smooth' })} style={{ position: 'absolute', top: '4%', left: '50%', transform: mounted ? 'translateX(-50%) translateY(0px)' : 'translateX(-50%) translateY(-200px)', opacity: mounted ? 1 : 0, transition: 'transform 1.4s 0.2s cubic-bezier(0.16,1,0.3,1), opacity 1s 0.2s ease', zIndex: 5, cursor: 'none' }}>
                    <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 340, height: 30, background: 'radial-gradient(ellipse, rgba(200,160,90,0.2) 0%, transparent 70%)', filter: 'blur(10px)', animation: 'shadowPulse 4s ease-in-out infinite' }} />
                    <div style={{ width: 340, height: 460, borderRadius: '4px 18px 18px 4px', background: 'linear-gradient(160deg, #0e0c1c 0%, #080614 50%, #060410 100%)', position: 'relative', boxShadow: '14px 24px 100px rgba(0,0,0,0.98), 0 0 80px rgba(200,160,90,0.06), inset 0 1px 0 rgba(200,160,90,0.08)', overflow: 'hidden', animation: mounted ? 'diaryFloat 10s ease-in-out infinite' : 'none' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, background: 'linear-gradient(90deg, #050312 0%, #0a0820 100%)', borderRight: '1px solid rgba(200,160,90,0.08)' }} />
                        <div style={{ position: 'absolute', left: 32, right: 0, top: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(200,160,90,0.04) 31px, rgba(200,160,90,0.04) 32px)' }} />
                        <div style={{ position: 'absolute', left: 60, right: 0, top: 0, bottom: 0, borderLeft: '1px solid rgba(220,60,60,0.07)' }} />
                        <div style={{ position: 'absolute', left: 47, right: 22, top: '50%', transform: 'translateY(-50%)', textAlign: 'center' }}>
                            <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.4), transparent)', margin: '0 auto 18px' }} />
                            <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 30, color: 'rgba(200,160,90,0.55)', margin: 0, letterSpacing: 3, textShadow: '0 0 30px rgba(200,160,90,0.2)' }}>drafts.</p>
                            <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.4), transparent)', margin: '18px auto' }} />
                            <p style={{ fontFamily: "'Palatino Linotype', Palatino, serif", fontSize: 8, fontStyle: 'italic', color: 'rgba(255,255,255,0.09)', margin: 0, letterSpacing: 6, textTransform: 'uppercase' }}>personal diary</p>
                        </div>
                        <div style={{ position: 'absolute', top: 18, right: 18, width: 6, height: 6, borderRadius: '50%', background: 'rgba(200,160,90,0.3)', boxShadow: '0 0 10px rgba(200,160,90,0.4)', animation: 'dotPulse 3s ease-in-out infinite' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 45%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', right: 0, top: '20%', width: 3, height: '60%', background: 'linear-gradient(180deg, transparent, rgba(200,160,90,0.15), transparent)' }} />
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)', zIndex: 6, opacity: mounted ? 1 : 0, transition: 'opacity 1.8s 1.2s ease', pointerEvents: 'none', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Palatino Linotype', Palatino, serif", fontStyle: 'italic', fontSize: 'clamp(13px, 1.4vw, 18px)', color: 'rgba(200,160,90,0.72)', letterSpacing: '0.48em', margin: 0, textTransform: 'uppercase', textShadow: '0 0 40px rgba(200,160,90,0.35)', animation: mounted ? 'textFloat 7s ease-in-out infinite' : 'none' }}>never meant to be sent.</p>
                </div>

                <div style={{ position: 'absolute', bottom: -28, left: 0, right: 0, zIndex: 2, overflow: 'hidden', transform: mounted ? 'translateY(0)' : 'translateY(120px)', opacity: mounted ? 1 : 0, transition: 'transform 1.6s 0.3s cubic-bezier(0.16,1,0.3,1), opacity 1.2s 0.3s ease', pointerEvents: 'none', userSelect: 'none' }}>
                    <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '37vw', fontWeight: 400, color: 'transparent', WebkitTextStroke: '1px rgba(200,160,90,0.055)', backgroundClip: 'text', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(180deg, rgba(200,160,90,0.25) 0%, rgba(200,160,90,0.08) 50%, rgba(200,160,90,0.02) 100%)', margin: 0, padding: 0, letterSpacing: '-0.02em', lineHeight: 0.82, whiteSpace: 'nowrap' }}>drafts.</h1>
                </div>

                <div style={{ position: 'absolute', bottom: 38, right: 42, zIndex: 5, opacity: mounted ? 0.45 : 0, transition: 'opacity 1.2s 1.5s ease', display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
                    <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 10, color: 'rgba(200,160,90,0.7)', margin: 0, letterSpacing: '0.45em', textTransform: 'uppercase' }}>scroll</p>
                    <div style={{ width: 38, height: 1, background: 'linear-gradient(90deg, rgba(200,160,90,0.8), transparent)', animation: 'scrollLine 2s ease-in-out infinite' }} />
                </div>

                <div style={{ position: 'absolute', top: 36, left: 42, zIndex: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 1.8s ease', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 17, color: 'rgba(200,160,90,0.85)', margin: 0, letterSpacing: 1, textShadow: '0 0 20px rgba(200,160,90,0.3)' }}>drafts.</p>
                    <div style={{ width: 1, height: 14, background: 'rgba(200,160,90,0.3)' }} />
                    <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.45)', margin: 0, letterSpacing: '0.35em', textTransform: 'uppercase' }}>personal diary</p>
                </div>
            </section>

            {/* SECTION 2 */}
            <section style={{ scrollSnapAlign: 'start', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(200,160,90,0.06) 0%, transparent 65%)', pointerEvents: 'none', animation: 'breathe 9s ease-in-out infinite' }} />

                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    {ghostPhrases.map((t, i) => (
                        <div key={i} style={{ position: 'absolute', left: i % 2 === 0 ? '-5%' : '55%', top: `${8 + i * 18}%`, fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(48px,8vw,110px)', color: 'transparent', WebkitTextStroke: `1px rgba(200,160,90,${0.028 + i * 0.006})`, whiteSpace: 'nowrap', userSelect: 'none', opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateX(0)' : `translateX(${i % 2 === 0 ? '-80px' : '80px'})`, transition: `all 1.4s ${0.05 * i}s cubic-bezier(0.16,1,0.3,1)`, animation: section >= 1 ? `${i % 2 === 0 ? 'driftTextL' : 'driftTextR'} ${14 + i * 3}s ease-in-out infinite` : 'none' }}>{t}</div>
                    ))}
                </div>

                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'linear-gradient(180deg, transparent 0%, rgba(200,160,90,0.08) 30%, rgba(200,160,90,0.15) 50%, rgba(200,160,90,0.08) 70%, transparent 100%)', pointerEvents: 'none', opacity: section >= 1 ? 1 : 0, transition: 'opacity 1.5s 0.5s ease', animation: section >= 1 ? 'linePulse 4s ease-in-out infinite' : 'none' }} />

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: 28 }}>
                        <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.55)', letterSpacing: '0.65em', textTransform: 'uppercase', margin: 0, opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s 0.3s ease' }}>your archive</p>
                    </div>

                    <div style={{ position: 'relative', marginBottom: 4 }}>
                        <h2 style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(52px,7.5vw,100px)', fontWeight: 400, color: 'rgba(240,230,210,0.95)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05, textShadow: '0 0 120px rgba(200,160,90,0.12)', opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateX(0)' : 'translateX(-40px)', transition: 'all 1s 0.15s cubic-bezier(0.16,1,0.3,1)' }}>your words.</h2>
                        <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.35), transparent)', transform: section >= 1 ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 1.2s 0.6s ease' }} />
                    </div>

                    <h2 style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(52px,7.5vw,100px)', fontWeight: 400, color: 'rgba(200,160,90,0.28)', margin: '0 0 22px', letterSpacing: '-0.03em', lineHeight: 1.05, opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateX(0)' : 'translateX(40px)', transition: 'all 1s 0.25s cubic-bezier(0.16,1,0.3,1)' }}>your world.</h2>

                    <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(200,160,90,0.35)', letterSpacing: '0.25em', margin: '0 0 52px', opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.9s 0.5s ease' }}>no one else reads this.</p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.9s 0.55s ease' }}>
                        <button onClick={() => navigate('/login')} style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 13, letterSpacing: '0.22em', color: 'rgba(200,160,90,0.8)', background: 'transparent', border: '1px solid rgba(200,160,90,0.25)', padding: '16px 52px', cursor: 'none', transition: 'all 0.35s ease', textTransform: 'uppercase' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,90,0.6)'; e.currentTarget.style.color = 'rgba(200,160,90,1)'; e.currentTarget.style.background = 'rgba(200,160,90,0.05)'; e.currentTarget.style.letterSpacing = '0.3em' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,160,90,0.25)'; e.currentTarget.style.color = 'rgba(200,160,90,0.8)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.letterSpacing = '0.22em' }}>
                            open diary
                        </button>
                        <button onClick={() => navigate('/register')} style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 13, letterSpacing: '0.22em', color: '#04030a', background: 'linear-gradient(135deg, rgba(200,160,90,0.92), rgba(175,125,55,0.96))', border: '1px solid transparent', padding: '16px 52px', cursor: 'none', transition: 'all 0.35s ease', textTransform: 'uppercase', boxShadow: '0 6px 40px rgba(200,160,90,0.2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(225,185,115,1), rgba(200,150,65,1))'; e.currentTarget.style.boxShadow = '0 14px 60px rgba(200,160,90,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.letterSpacing = '0.3em' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,160,90,0.92), rgba(175,125,55,0.96))'; e.currentTarget.style.boxShadow = '0 6px 40px rgba(200,160,90,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.letterSpacing = '0.22em' }}>
                            begin writing
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 80, opacity: section >= 1 ? 1 : 0, transform: section >= 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.9s 0.75s ease', borderTop: '1px solid rgba(200,160,90,0.06)', paddingTop: 32 }}>
                        {[{ word: 'draw', sub: 'on every page' }, { word: 'lock', sub: 'your secrets' }, { word: 'keep', sub: 'it forever' }].map(({ word, sub }, i) => (
                            <div key={word} style={{ textAlign: 'center', padding: '0 44px', borderRight: i < 2 ? '1px solid rgba(200,160,90,0.08)' : 'none' }}>
                                <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 24, color: 'rgba(200,160,90,0.65)', margin: '0 0 6px', textShadow: '0 0 20px rgba(200,160,90,0.2)' }}>{word}</p>
                                <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 8, color: 'rgba(200,160,90,0.28)', margin: 0, letterSpacing: '0.45em', textTransform: 'uppercase' }}>{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3 — FOOTER */}
            <section style={{ scrollSnapAlign: 'start', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', background: 'transparent', position: 'relative', overflow: 'hidden', paddingBottom: 60 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 80%, rgba(200,160,90,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: '28vw', color: 'transparent', WebkitTextStroke: '1px rgba(200,160,90,0.03)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', opacity: section >= 2 ? 1 : 0, transition: 'opacity 2s ease', animation: section >= 2 ? 'breathe 12s ease-in-out infinite' : 'none' }}>drafts.</div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.2), transparent)', opacity: section >= 2 ? 1 : 0, transition: 'opacity 1s ease' }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 'auto', marginTop: 'auto', opacity: section >= 2 ? 1 : 0, transform: section >= 2 ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s 0.2s ease' }}>
                    <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(28px,4vw,52px)', color: 'rgba(240,230,210,0.7)', margin: '0 0 12px', letterSpacing: '-0.01em', textShadow: '0 0 60px rgba(200,160,90,0.15)' }}>the things you never said.</p>
                    <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(200,160,90,0.35)', letterSpacing: '0.3em', margin: 0 }}>kept safe. forever yours.</p>
                </div>

                <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900, padding: '0 40px' }}>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,90,0.18), transparent)', marginBottom: 36, opacity: section >= 2 ? 1 : 0, transform: section >= 2 ? 'scaleX(1)' : 'scaleX(0)', transition: 'all 1.2s 0.4s ease' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: section >= 2 ? 1 : 0, transform: section >= 2 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s 0.6s ease', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 20, color: 'rgba(200,160,90,0.7)', margin: '0 0 5px', letterSpacing: 1 }}>drafts.</p>
                            <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.25)', margin: 0, letterSpacing: '0.35em', textTransform: 'uppercase' }}>personal diary — 2025</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontFamily: "'Palatino Linotype', serif", fontStyle: 'italic', fontSize: 11, color: 'rgba(200,160,90,0.4)', margin: '0 0 4px', letterSpacing: '0.15em' }}>designed & developed by</p>
                            <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 20, color: 'rgba(200,160,90,0.78)', margin: 0, letterSpacing: 1, textShadow: '0 0 20px rgba(200,160,90,0.2)' }}>Mohini</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.22)', margin: '0 0 4px', letterSpacing: '0.35em', textTransform: 'uppercase' }}>all rights reserved</p>
                            <p style={{ fontFamily: "'Palatino Linotype', serif", fontSize: 9, color: 'rgba(200,160,90,0.15)', margin: 0, letterSpacing: '0.3em', textTransform: 'uppercase' }}>© {new Date().getFullYear()} drafts.</p>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes breathe {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.06); }
                }
                @keyframes diaryFloat {
                    0%   { transform: translateY(0px) rotate(0deg); }
                    25%  { transform: translateY(-6px) rotate(0.3deg); }
                    50%  { transform: translateY(-10px) rotate(0deg); }
                    75%  { transform: translateY(-6px) rotate(-0.3deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes floatStamp {
                    0%   { transform: rotate(-2deg) translateY(0px); }
                    25%  { transform: rotate(-1.6deg) translateY(-7px); }
                    50%  { transform: rotate(-2deg) translateY(-11px); }
                    75%  { transform: rotate(-2.4deg) translateY(-7px); }
                    100% { transform: rotate(-2deg) translateY(0px); }
                }
                @keyframes stampAura {
                    0%, 100% { opacity: 0.25; transform: scale(1); }
                    50% { opacity: 0.65; transform: scale(1.12); }
                }
                @keyframes dotPulse {
                    0%, 100% { opacity: 0.3; box-shadow: 0 0 6px rgba(200,160,90,0.3); }
                    50% { opacity: 1; box-shadow: 0 0 18px rgba(200,160,90,0.7); }
                }
                @keyframes shadowPulse {
                    0%, 100% { width: 300px; opacity: 0.6; }
                    50% { width: 420px; opacity: 1; }
                }
                @keyframes textFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes scrollLine {
                    0%, 100% { transform: scaleX(1); opacity: 0.5; }
                    50% { transform: scaleX(1.6); opacity: 1; }
                }
                @keyframes inkFade {
                    0%   { opacity: 0.8; transform: scaleX(1); }
                    100% { opacity: 0; transform: scaleX(1.5); }
                }
                @keyframes linePulse {
                    0%, 100% { opacity: 0.4; }
                    50%      { opacity: 1; }
                }
                @keyframes driftTextL {
                    0%, 100% { transform: translateX(0px); }
                    50%      { transform: translateX(-18px); }
                }
                @keyframes driftTextR {
                    0%, 100% { transform: translateX(0px); }
                    50%      { transform: translateX(18px); }
                }
            `}</style>
        </div>
    )
}