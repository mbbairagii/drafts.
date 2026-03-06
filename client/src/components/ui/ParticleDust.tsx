import { useEffect, useRef } from 'react'

interface Particle {
    x: number; y: number; vx: number; vy: number
    size: number; opacity: number; life: number; maxLife: number; color: string
}

export default function ParticleDust() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particles = useRef<Particle[]>([])
    const raf = useRef<number>(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)

        let frame = 0
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            frame++
            if (frame % 14 === 0 && particles.current.length < 50) {
                const life = 160 + Math.random() * 200
                particles.current.push({ x: Math.random() * canvas.width, y: canvas.height + 10, vx: (Math.random() - 0.5) * 0.4, vy: -(0.15 + Math.random() * 0.5), size: 0.5 + Math.random() * 1.2, opacity: 0, life: 0, maxLife: life, color: ['rgba(26,107,255,', 'rgba(108,99,255,', 'rgba(245,242,237,'][Math.floor(Math.random() * 3)] })
            }
            particles.current = particles.current.filter(p => p.life < p.maxLife)
            for (const p of particles.current) {
                p.life++; p.x += p.vx + Math.sin(p.life * 0.02) * 0.25; p.y += p.vy
                const prog = p.life / p.maxLife
                p.opacity = prog < 0.2 ? prog / 0.2 : prog > 0.8 ? 1 - (prog - 0.8) / 0.2 : 1
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = p.color + (p.opacity * 0.5) + ')'; ctx.fill()
            }
            raf.current = requestAnimationFrame(animate)
        }
        raf.current = requestAnimationFrame(animate)
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf.current) }
    }, [])

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}