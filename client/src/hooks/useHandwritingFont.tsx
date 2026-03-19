import { useState, useEffect, useMemo, useCallback } from 'react'
import type { HandwritingFont } from '../types'

const STORAGE_KEY = 'drafts_custom_font'

export function useHandwritingFont() {
    const [customFontData, setCustomFontData] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEY)
    })

    useEffect(() => {
        if (!customFontData) return
        const existing = document.getElementById('drafts-custom-font-face')
        if (existing) existing.remove()
        const style = document.createElement('style')
        style.id = 'drafts-custom-font-face'
        style.textContent = `@font-face { font-family: 'MyHandwriting'; src: url('data:font/ttf;base64,${customFontData}'); font-display: swap; }`
        document.head.appendChild(style)
    }, [customFontData])

    // ✅ Stable reference — only recreates when customFontData actually changes
    const customFont = useMemo<HandwritingFont | null>(() => {
        if (!customFontData) return null
        return { id: 'my-handwriting', family: "'MyHandwriting', Georgia, serif", label: 'My Handwriting' }
    }, [customFontData])

    // ✅ Stable function reference — won't cause re-renders in consumers
    const saveFont = useCallback((fontData: string) => {
        localStorage.setItem(STORAGE_KEY, fontData)
        setCustomFontData(fontData)
    }, [])

    const clearFont = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setCustomFontData(null)
        document.getElementById('drafts-custom-font-face')?.remove()
    }, [])

    return { customFont, customFontData, saveFont, clearFont, hasCustomFont: !!customFontData }
}
