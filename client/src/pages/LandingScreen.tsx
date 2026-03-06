import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import skullStamp from '../assets/11.png'
import moon from '../assets/33.png'

export default function LandingScreen() {
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeSection, setActiveSection] = useState(0)
    const [diaryHovered, setDiaryHovered] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const onScroll = () => setActiveSection(Math.round(container.scrollTop / container.clientHeight))
        container.addEventListener('scroll', onScroll, { passive: true })
        return () => container.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                height: '100vh',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                background: '#080808',
            }}
        >
            <section style={{
                scrollSnapAlign: 'start',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                background: '#07050f',
            }}>

                <div style={{
                    position: 'absolute',
                    left: '-10vw',
                    top: '25%',
                    width: '62vw',
                    height: '62vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(180,30,50,0.3) 0%, rgba(120,15,30,0.13) 45%, transparent 70%)',
                    filter: 'blur(65px)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 2.5s 0.4s ease',
                    animation: 'pulseRed 8s ease-in-out infinite',
                }} />

                <div style={{
                    position: 'absolute',
                    right: '-5vw',
                    top: '-5vh',
                    width: '52vw',
                    height: '52vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(100,85,255,0.2) 0%, rgba(60,45,180,0.09) 50%, transparent 70%)',
                    filter: 'blur(55px)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 2.5s 0.8s ease',
                    animation: 'pulseIndigo 10s 1s ease-in-out infinite',
                }} />

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 50% 100%, rgba(60,40,120,0.22) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(110deg, transparent 20%, rgba(100,85,255,0.07) 40%, rgba(180,30,50,0.08) 60%, transparent 80%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 2s 1s ease',
                    animation: 'auroraSlide 14s ease-in-out infinite',
                }} />

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)`,
                    backgroundSize: '52px 52px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 3s ease',
                }} />

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)`,
                    backgroundSize: '18px 18px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: mounted ? 0.8 : 0,
                    transition: 'opacity 3s 0.5s ease',
                }} />

                <img
                    src={moon}
                    alt="moon"
                    style={{
                        position: 'absolute',
                        left: '-35vw',
                        top: '50%',
                        transform: mounted
                            ? 'translate(0, -50%)'
                            : 'translate(-180px, -50%)',
                        width: '69vw',
                        height: '69vw',
                        objectFit: 'contain',
                        opacity: mounted ? 0.75 : 0,
                        transition: 'transform 1.8s 0.2s cubic-bezier(0.16,1,0.3,1), opacity 1.4s 0.2s ease',
                        zIndex: 1,
                        pointerEvents: 'none',
                        filter: 'brightness(0.88) contrast(1.2) saturate(1.1)',
                        mixBlendMode: 'normal',
                    }}
                />

                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32vw',
                    height: '100vh',
                    background: 'linear-gradient(90deg, rgba(7,5,15,0.95) 0%, rgba(7,5,15,0.5) 60%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }} />

                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '35vh',
                    background: 'linear-gradient(0deg, rgba(7,5,15,0.8) 0%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />

                <div
                    style={{
                        position: 'absolute',
                        top: '12%',
                        right: '4%',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0) rotate(-2deg)' : 'translateY(-80px) rotate(-2deg)',
                        transition: 'transform 1.2s 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.8s 0.5s ease',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 14,
                        cursor: 'none',
                        filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.8))',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        inset: -30,
                        background: 'radial-gradient(ellipse, rgba(180,150,90,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                        animation: 'stampGlow 4s ease-in-out infinite',
                    }} />
                    <img
                        src={skullStamp}
                        alt="skull stamp"
                        style={{
                            width: 340,
                            height: 340,
                            objectFit: 'contain',
                            filter: 'grayscale(10%) brightness(0.85) contrast(1.15) sepia(0.1)',
                            opacity: 0.92,
                        }}
                    />
                    <p style={{
                        fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
                        fontStyle: 'italic',
                        fontSize: 15,
                        color: 'rgba(255,255,255,0.2)',
                        letterSpacing: '0.28em',
                        margin: 0,
                        whiteSpace: 'nowrap',
                    }}>written in the dark.</p>
                </div>

                <div
                    onMouseEnter={() => setDiaryHovered(true)}
                    onMouseLeave={() => setDiaryHovered(false)}
                    onClick={() => containerRef.current?.scrollTo({ top: containerRef.current.clientHeight, behavior: 'smooth' })}
                    style={{
                        position: 'absolute',
                        top: '5%',
                        left: '50%',
                        transform: mounted
                            ? 'translateX(-50%) translateY(0px)'
                            : 'translateX(-50%) translateY(-160px)',
                        opacity: mounted ? 1 : 0,
                        transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease',
                        zIndex: 3,
                        cursor: 'none',
                        filter: 'drop-shadow(0 30px 80px rgba(108,99,255,0.15))',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        bottom: -30, left: '50%',
                        transform: 'translateX(-50%)',
                        width: diaryHovered ? 390 : 300,
                        height: 20,
                        background: 'radial-gradient(ellipse, rgba(108,99,255,0.35) 0%, transparent 70%)',
                        filter: 'blur(14px)',
                        transition: 'width 0.6s ease',
                    }} />

                    <div style={{
                        width: 360,
                        height: 480,
                        borderRadius: '4px 16px 16px 4px',
                        background: 'linear-gradient(145deg, #1c1c32 0%, #0f0f23 100%)',
                        position: 'relative',
                        boxShadow: diaryHovered
                            ? '10px 20px 80px rgba(0,0,0,0.98), 0 0 120px rgba(108,99,255,0.25), inset 0 1px 0 rgba(108,99,255,0.1)'
                            : '10px 20px 60px rgba(0,0,0,0.9), 0 0 60px rgba(108,99,255,0.08), inset 0 1px 0 rgba(108,99,255,0.05)',
                        transition: 'box-shadow 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                        transform: diaryHovered ? 'translateY(-10px) scale(1.02) rotate(-0.5deg)' : 'translateY(0) scale(1) rotate(0deg)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0, width: 36,
                            background: 'linear-gradient(90deg, #07071a 0%, #1a1a35 100%)',
                            borderRight: '1px solid rgba(108,99,255,0.12)',
                        }} />

                        {[98, 180, 262, 344, 412].map((top, i) => (
                            <div key={i} style={{
                                position: 'absolute', left: 57, right: 24, height: 1,
                                background: 'rgba(108,99,255,0.07)', top,
                            }} />
                        ))}

                        <div style={{
                            position: 'absolute', left: 57, right: 24,
                            top: '50%', transform: 'translateY(-50%)',
                            textAlign: 'center',
                        }}>
                            <p style={{
                                fontFamily: "'IM Fell English', serif",
                                fontStyle: 'italic',
                                fontSize: 34,
                                color: 'rgba(108,99,255,0.6)',
                                margin: 0,
                                letterSpacing: 2,
                            }}>drafts.</p>
                            <div style={{
                                width: 50, height: 1,
                                background: 'rgba(108,99,255,0.25)',
                                margin: '14px auto',
                            }} />
                            <p style={{
                                fontFamily: "'IM Fell English', serif",
                                fontStyle: 'italic',
                                fontSize: 11,
                                color: 'rgba(255,255,255,0.12)',
                                margin: 0,
                                letterSpacing: 4,
                                textTransform: 'uppercase',
                            }}>personal diary</p>
                        </div>

                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.1) 0%, transparent 70%)',
                            opacity: diaryHovered ? 1 : 0,
                            transition: 'opacity 0.4s ease',
                        }} />

                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
                        }} />
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 1s 0.6s ease',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                }}>
                    <p style={{
                        fontFamily: "'IM Fell English', serif",
                        fontStyle: 'italic',
                        fontSize: 'clamp(14px, 1.6vw, 20px)',
                        color: '#2a2a3a',
                        letterSpacing: '0.38em',
                        margin: 0,
                    }}>never meant to be sent.</p>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: -20,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                    overflow: 'hidden',
                    transform: mounted ? 'translateY(0)' : 'translateY(100px)',
                    opacity: mounted ? 1 : 0,
                    transition: 'transform 1.3s cubic-bezier(0.16,1,0.3,1), opacity 1s ease',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}>
                    <h1 style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: '38vw',
                        fontWeight: 400,
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(240,236,228,0.07)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        backgroundImage: 'linear-gradient(180deg, #f0ece4 0%, rgba(240,236,228,0.6) 60%, rgba(240,236,228,0.15) 100%)',
                        margin: 0,
                        padding: 0,
                        letterSpacing: '-0.02em',
                        lineHeight: 0.82,
                        whiteSpace: 'nowrap',
                    }}>
                        drafts.
                    </h1>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 36, right: 40,
                    zIndex: 4,
                    opacity: mounted ? 0.35 : 0,
                    transition: 'opacity 1s 1.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    pointerEvents: 'none',
                }}>
                    <p style={{
                        fontFamily: "'IM Fell English', serif",
                        fontStyle: 'italic',
                        fontSize: 11,
                        color: '#f0ece4',
                        margin: 0,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                    }}>scroll</p>
                    <div style={{
                        width: 40, height: 1,
                        background: '#f0ece4',
                        animation: 'scrollPulse 2s ease-in-out infinite',
                    }} />
                </div>
            </section>

            <section style={{
                scrollSnapAlign: 'start',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#080808',
            }}>
                <div style={{
                    textAlign: 'center',
                    opacity: activeSection >= 1 ? 1 : 0,
                    transform: activeSection >= 1 ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
                }}>
                    <h2 style={{
                        fontFamily: "'IM Fell English', serif",
                        fontStyle: 'italic',
                        fontSize: 'clamp(36px, 5vw, 64px)',
                        fontWeight: 400,
                        color: '#f0ece4',
                        margin: '0 0 8px',
                        letterSpacing: '-0.02em',
                    }}>your words.</h2>
                    <h2 style={{
                        fontFamily: "'IM Fell English', serif",
                        fontStyle: 'italic',
                        fontSize: 'clamp(36px, 5vw, 64px)',
                        fontWeight: 400,
                        color: '#2e2e3e',
                        margin: '0 0 60px',
                        letterSpacing: '-0.02em',
                    }}>your world.</h2>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                fontFamily: "'IM Fell English', serif",
                                fontStyle: 'italic',
                                fontSize: 16,
                                letterSpacing: '0.1em',
                                color: '#f0ece4',
                                background: 'transparent',
                                border: '1px solid rgba(240,236,228,0.2)',
                                padding: '15px 44px',
                                cursor: 'none',
                                transition: 'all 0.3s ease',
                                borderRadius: 2,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(240,236,228,0.7)'
                                e.currentTarget.style.background = 'rgba(240,236,228,0.04)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(240,236,228,0.2)'
                                e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            open diary
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                fontFamily: "'IM Fell English', serif",
                                fontStyle: 'italic',
                                fontSize: 16,
                                letterSpacing: '0.1em',
                                color: '#080808',
                                background: '#f0ece4',
                                border: '1px solid #f0ece4',
                                padding: '15px 44px',
                                cursor: 'none',
                                transition: 'all 0.3s ease',
                                borderRadius: 2,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ffffff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f0ece4' }}
                        >
                            begin writing
                        </button>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes scrollPulse {
                    0%, 100% { transform: scaleX(1); opacity: 0.35; }
                    50% { transform: scaleX(1.5); opacity: 0.7; }
                }
                @keyframes stampGlow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                @keyframes pulseRed {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.85; }
                    40% { transform: scale(1.15) translate(3%, -4%); opacity: 1; }
                    70% { transform: scale(0.92) translate(-2%, 3%); opacity: 0.6; }
                }
                @keyframes pulseIndigo {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.9; }
                    50% { transform: scale(1.2) translate(-4%, 5%); opacity: 0.5; }
                }
                @keyframes auroraSlide {
                    0%, 100% { transform: translateX(-15%) skewX(-5deg); opacity: 0.5; }
                    50% { transform: translateX(15%) skewX(5deg); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
