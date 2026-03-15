import { useEffect, useRef } from 'react'
import type { ToolId } from '../../types'

interface Props {
    tool: ToolId | null
    color: string
}

export default function CustomCursor({ tool, color }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const move = (e: MouseEvent) => {
            if (ref.current) {
                ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
            }
        }
        const style = document.createElement('style')
        style.textContent = `* { cursor: none !important; }`
        document.head.appendChild(style)
        document.addEventListener('mousemove', move, { passive: true })
        return () => {
            document.removeEventListener('mousemove', move)
            document.head.removeChild(style)
        }
    }, [])

    const icons: Record<string, string> = {
        pen: '🖊️', pencil: '✏️', highlighter: '🖌️', eraser: '◻', text: 'I',
    }

    return (
        <div
            ref={ref}
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 999999, willChange: 'transform', transform: 'translate(-200px, -200px)' }}
        >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginLeft: -5, marginTop: -5, boxShadow: `0 0 6px ${color}` }} />
            {tool && icons[tool] && (
                <span style={{ position: 'absolute', top: -20, left: 8, fontSize: 14, userSelect: 'none', pointerEvents: 'none' }}>
                    {icons[tool]}
                </span>
            )}
        </div>
    )
}
