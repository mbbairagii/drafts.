export type ToolId = 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'text'
export type PanelId = 'stickers' | 'themes' | 'cover' | 'pages'
export type CoverId = 'midnight' | 'crimson' | 'forest' | 'ivory' | 'slate' | 'rose'
export type ThemeId = 'aged' | 'void' | 'grid' | 'dot' | 'blood' | 'ink' | 'cream' | 'blank' | 'dark' | 'forest' | 'rose'

export interface User {
    _id: string
    email: string
    username: string
    createdAt: string
}

export interface Diary {
    _id: string
    name: string
    cover: string
    coverStickers?: StickerElement[]
    passwordHash?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface TextElement {
    id: string
    x: number
    y: number
    text: string
    fontSize: number
    fontFamily: string
    color: string
}

export interface StickerElement {
    id: string
    emoji?: string
    src?: string
    x: number
    y: number
    size: number
    rotation: number
}

export interface ImageElement {
    id: string
    src: string
    x: number
    y: number
    width: number
    height: number
}

export interface DiaryPage {
    _id: string
    diaryId: string
    theme: ThemeId
    pageIndex: number
    drawingData: string | null
    textElements: TextElement[]
    stickers: StickerElement[]
    images: ImageElement[]
    createdAt: string
}

export interface Sticker {
    id: number
    emoji: string
    label: string
}

export interface PageTheme {
    id: ThemeId
    name: string
    bg: string
    lineColor: string
    textColor: string
    pattern: 'lined' | 'grid' | 'dot' | 'blank'
}

export interface HandwritingFont {
    id: string
    name: string
    url: string
    family: string
}
