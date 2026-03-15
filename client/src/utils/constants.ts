export interface CoverStyle {
    id: string
    label: string
    spine: string
    body: string
    bg: string
    accent: string
    glow: string
    page: string
    bgImage?: string
}

export const COVER_STYLES: CoverStyle[] = [
    { id: 'midnight', label: 'Midnight', spine: '#1a1d3a', body: '#22265a', bg: '#22265a', accent: '#a0aaff', glow: 'rgba(107,127,255,0.5)', page: '#f0f0fa' },
    { id: 'crimson', label: 'Crimson', spine: '#3a1a1a', body: '#5a2222', bg: '#5a2222', accent: '#ffaaaa', glow: 'rgba(255,107,107,0.5)', page: '#fdf0f0' },
    { id: 'forest', label: 'Forest', spine: '#1a3a1a', body: '#225a22', bg: '#225a22', accent: '#aaffcc', glow: 'rgba(107,255,158,0.5)', page: '#f0fdf4' },
    { id: 'ivory', label: 'Ivory', spine: '#3a3a1a', body: '#5a5a22', bg: '#5a5a22', accent: '#ffeeaa', glow: 'rgba(255,224,102,0.5)', page: '#fdfdf0' },
    { id: 'slate', label: 'Slate', spine: '#1a2030', body: '#22304a', bg: '#22304a', accent: '#aabccc', glow: 'rgba(160,180,204,0.5)', page: '#f0f4f8' },
    { id: 'rose', label: 'Rose', spine: '#3a1a2a', body: '#5a223a', bg: '#5a223a', accent: '#ffaad4', glow: 'rgba(255,153,204,0.5)', page: '#fdf0f6' },
]

export const HANDWRITING_FONTS = [
    { id: 'caveat', family: 'Caveat, cursive', label: 'Caveat' },
    { id: 'shadows', family: "'Shadows Into Light', cursive", label: 'Shadows' },
    { id: 'dancing', family: "'Dancing Script', cursive", label: 'Dancing' },
    { id: 'patrick', family: "'Patrick Hand', cursive", label: 'Patrick' },
    { id: 'indie', family: "'Indie Flower', cursive", label: 'Indie Flower' },
    { id: 'pacifico', family: 'Pacifico, cursive', label: 'Pacifico' },
]
