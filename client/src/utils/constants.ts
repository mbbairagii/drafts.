export interface CoverStyle {
    id: string
    label: string
    spine: string
    body: string
    bg: string
    accent: string
    glow: string
    page: string
    bgImage: string
}

export const COVER_STYLES: CoverStyle[] = [
    {
        id: 'void', label: 'Void',
        spine: '#0a080f', body: '#12101a', bg: '#12101a',
        accent: '#9b8fff', glow: 'rgba(120,100,255,0.5)',
        page: '#f0f0fa', bgImage: '/covers/void.jpeg',
    },
    {
        id: 'scarab', label: 'Scarab',
        spine: '#0d1f0d', body: '#152615', bg: '#152615',
        accent: '#7dffb3', glow: 'rgba(80,220,130,0.5)',
        page: '#f0fdf4', bgImage: '/covers/scarab.jpeg',
    },
    {
        id: 'versailles', label: 'Versailles',
        spine: '#0d1625', body: '#152035', bg: '#152035',
        accent: '#88bbff', glow: 'rgba(80,140,255,0.5)',
        page: '#f0f4fd', bgImage: '/covers/versailles.jpeg',
    },
    {
        id: 'crimson-seal', label: 'Crimson-Seal',
        spine: '#1f0808', body: '#2e0e0e', bg: '#2e0e0e',
        accent: '#ff8888', glow: 'rgba(255,80,80,0.5)',
        page: '#fdf0f0', bgImage: '/covers/crimson-seal.png',
    },
    {
        id: 'nevermore', label: 'Nevermore',
        spine: '#120d20', body: '#1c1530', bg: '#1c1530',
        accent: '#cc99ff', glow: 'rgba(160,100,255,0.5)',
        page: '#f8f0ff', bgImage: '/covers/nevermore.jpeg',
    },
    {
        id: 'relic', label: 'Relic',
        spine: '#1a1505', body: '#2a2008', bg: '#2a2008',
        accent: '#d4aa55', glow: 'rgba(200,160,60,0.5)',
        page: '#fdfaf0', bgImage: '/covers/relic.png',
    },
]

export const HANDWRITING_FONTS = [
    { id: 'caveat', family: 'Caveat, cursive', label: 'Caveat' },
    { id: 'shadows', family: "'Shadows Into Light', cursive", label: 'Shadows' },
    { id: 'dancing', family: "'Dancing Script', cursive", label: 'Dancing' },
    { id: 'patrick', family: "'Patrick Hand', cursive", label: 'Patrick' },
    { id: 'indie', family: "'Indie Flower', cursive", label: 'Indie Flower' },
    { id: 'pacifico', family: 'Pacifico, cursive', label: 'Pacifico' },
]

export const PAGE_THEMES = [
    { id: 'aged', name: 'Aged', bg: '#f5f0e8', lineColor: 'rgba(160,140,100,0.25)', textColor: '#3a3020', pattern: 'lined' as const },
    { id: 'cream', name: 'Cream', bg: '#fdfaf4', lineColor: 'rgba(180,160,120,0.2)', textColor: '#3a3020', pattern: 'lined' as const },
    { id: 'blank', name: 'Blank', bg: '#fafafa', lineColor: 'transparent', textColor: '#222', pattern: 'blank' as const },
    { id: 'grid', name: 'Grid', bg: '#f8f8ff', lineColor: 'rgba(100,120,200,0.12)', textColor: '#222', pattern: 'grid' as const },
    { id: 'dot', name: 'Dot', bg: '#fafafa', lineColor: 'rgba(100,100,150,0.18)', textColor: '#222', pattern: 'dot' as const },
    { id: 'dark', name: 'Dark', bg: '#14121e', lineColor: 'rgba(200,180,255,0.07)', textColor: '#ddd', pattern: 'lined' as const },
    { id: 'ink', name: 'Ink', bg: '#0e1018', lineColor: 'rgba(100,160,255,0.08)', textColor: '#c8d8ff', pattern: 'lined' as const },
    { id: 'blood', name: 'Blood', bg: '#1a0808', lineColor: 'rgba(255,60,60,0.08)', textColor: '#ffb8b8', pattern: 'lined' as const },
    { id: 'forest', name: 'Forest', bg: '#0d1a10', lineColor: 'rgba(100,220,120,0.08)', textColor: '#b8ffcc', pattern: 'lined' as const },
    { id: 'rose', name: 'Rose', bg: '#1a0d12', lineColor: 'rgba(255,120,160,0.08)', textColor: '#ffc8d8', pattern: 'lined' as const },
    { id: 'void', name: 'Void', bg: '#050508', lineColor: 'rgba(255,255,255,0.04)', textColor: '#888', pattern: 'lined' as const },
]

export const TOOL_COLORS = [
    '#1a0f00', '#2c1810', '#8b2020', '#1a2c1a',
    '#1a1a3a', '#3a1a2c', '#1a1a1a', '#4a3a00',
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
    '#c77dff', '#ff9a3c', '#ffffff', '#aaaaaa',
    '#555555', '#000000',
]
