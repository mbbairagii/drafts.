export type ToolId = 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'text'
export type PanelId = 'stickers' | 'themes' | 'cover' | 'pages'
export type CoverId = 'obsidian' | 'crimson' | 'void' | 'aurora' | 'absinthe' | 'ghost'
export type ThemeId = 'aged' | 'void' | 'grid' | 'dot' | 'blood' | 'ink'

export interface User {
    _id: string
    email: string
    username: string
    createdAt: string
}

export interface Diary {
    _id: string
    userId: string
    name: string
    cover: CoverId
    passwordHash?: string
    pageCount: number
    createdAt: string
    lastModified: string
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
    emoji: string
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

export interface CoverStyle {
    id: CoverId
    name: string
    bg: string
    accent: string
    glow: string
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