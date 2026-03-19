import { useState, useEffect } from 'react'
import type { HandwritingFont } from '../types'

const STORAGE_KEY = 'drafts_custom_font'

export function useHandwritingFont() {
    const [customFontData, setCustomFontData] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEY)
    })

    // Inject @font-face whenever data is loaded
    useEffect(() => {
        if (!customFontData) return
        const existing = document.getElementById('drafts-custom-font-face')
        if (existing) existing.remove()
        const style = document.createElement('style')
        style.id = 'drafts-custom-font-face'
        style.textContent = `@font-face { font-family: 'MyHandwriting'; src: url('data:font/ttf;base64,${customFontData}'); font-display: swap; }`
        document.head.appendChild(style)
    }, [customFontData])

    const saveFont = (fontData: string) => {
        localStorage.setItem(STORAGE_KEY, fontData)
        setCustomFontData(fontData)
    }

    const clearFont = () => {
        localStorage.removeItem(STORAGE_KEY)
        setCustomFontData(null)
        document.getElementById('drafts-custom-font-face')?.remove()
    }

    const customFont: HandwritingFont | null = customFontData
        ? { id: 'my-handwriting', family: "'MyHandwriting', Georgia, serif", label: 'My Handwriting' }
        : null

    return { customFont, customFontData, saveFont, clearFont, hasCustomFont: !!customFontData }
}
