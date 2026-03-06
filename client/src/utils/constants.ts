import type { CoverStyle, PageTheme, HandwritingFont, Sticker } from '../types'

export const COVER_STYLES: CoverStyle[] = [
    { id: 'obsidian', name: 'Obsidian', bg: 'linear-gradient(145deg,#0a0a0f 0%,#1a1a2e 40%,#16213e 70%,#0f0f23 100%)', accent: '#6c63ff', glow: 'rgba(108,99,255,0.4)' },
    { id: 'crimson', name: 'Crimson', bg: 'linear-gradient(145deg,#1a0000 0%,#3d0000 40%,#5c0011 70%,#1a0008 100%)', accent: '#ff2244', glow: 'rgba(255,34,68,0.4)' },
    { id: 'void', name: 'Void', bg: 'linear-gradient(145deg,#000000 0%,#0d0d0d 40%,#111 70%,#000 100%)', accent: '#00fff7', glow: 'rgba(0,255,247,0.3)' },
    { id: 'aurora', name: 'Aurora', bg: 'linear-gradient(145deg,#001a12 0%,#002a1f 40%,#004030 70%,#001a15 100%)', accent: '#00ffaa', glow: 'rgba(0,255,170,0.35)' },
    { id: 'absinthe', name: 'Absinthe', bg: 'linear-gradient(145deg,#0a1200 0%,#1a2500 40%,#2a3800 70%,#0d1800 100%)', accent: '#aaff00', glow: 'rgba(170,255,0,0.3)' },
    { id: 'ghost', name: 'Ghost', bg: 'linear-gradient(145deg,#1a1520 0%,#2a2035 40%,#1f1830 70%,#150f25 100%)', accent: '#e0c9ff', glow: 'rgba(224,201,255,0.35)' },
]

export const PAGE_THEMES: PageTheme[] = [
    { id: 'aged', name: 'Aged Parchment', bg: '#f5f0e8', lineColor: '#d4c4a0', textColor: '#1a0f00', pattern: 'lined' },
    { id: 'void', name: 'Void Black', bg: '#0a0a0d', lineColor: '#1a1a25', textColor: '#e8e0ff', pattern: 'lined' },
    { id: 'grid', name: 'Blueprint', bg: '#0d1a2e', lineColor: '#1a3050', textColor: '#a0d4ff', pattern: 'grid' },
    { id: 'dot', name: 'Dot Matrix', bg: '#fafaf5', lineColor: '#c8c0a8', textColor: '#1a1208', pattern: 'dot' },
    { id: 'blood', name: 'Blood Moon', bg: '#100008', lineColor: '#2a0015', textColor: '#ff8099', pattern: 'lined' },
    { id: 'ink', name: 'Ink Wash', bg: '#f8f6f0', lineColor: '#e0d8c8', textColor: '#0a0804', pattern: 'blank' },
]

export const HANDWRITING_FONTS: HandwritingFont[] = [
    { id: 'caveat', name: 'Caveat', url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap', family: "'Caveat', cursive" },
    { id: 'dancing', name: 'Dancing Script', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap', family: "'Dancing Script', cursive" },
    { id: 'kalam', name: 'Kalam', url: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap', family: "'Kalam', cursive" },
    { id: 'patrick', name: 'Patrick Hand', url: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap', family: "'Patrick Hand', cursive" },
    { id: 'satisfy', name: 'Satisfy', url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap', family: "'Satisfy', cursive" },
    { id: 'pacifico', name: 'Pacifico', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', family: "'Pacifico', cursive" },
]

export const STICKERS: Sticker[] = [
    { id: 1, emoji: '🌸', label: 'Blossom' }, { id: 2, emoji: '⭐', label: 'Star' },
    { id: 3, emoji: '❤️', label: 'Heart' }, { id: 4, emoji: '🦋', label: 'Butterfly' },
    { id: 5, emoji: '🌙', label: 'Moon' }, { id: 6, emoji: '☀️', label: 'Sun' },
    { id: 7, emoji: '🌈', label: 'Rainbow' }, { id: 8, emoji: '🎀', label: 'Ribbon' },
    { id: 9, emoji: '🍃', label: 'Leaf' }, { id: 10, emoji: '✨', label: 'Sparkle' },
    { id: 11, emoji: '🔮', label: 'Crystal' }, { id: 12, emoji: '🕯️', label: 'Candle' },
    { id: 13, emoji: '🗝️', label: 'Key' }, { id: 14, emoji: '🌿', label: 'Herb' },
    { id: 15, emoji: '💎', label: 'Gem' }, { id: 16, emoji: '🔥', label: 'Flame' },
    { id: 17, emoji: '⚡', label: 'Bolt' }, { id: 18, emoji: '🌊', label: 'Wave' },
    { id: 19, emoji: '🦚', label: 'Peacock' }, { id: 20, emoji: '🍀', label: 'Clover' },
    { id: 21, emoji: '💀', label: 'Skull' }, { id: 22, emoji: '🌑', label: 'Dark Moon' },
    { id: 23, emoji: '🪐', label: 'Planet' }, { id: 24, emoji: '🖤', label: 'Black Heart' },
]

export const TOOL_COLORS: string[] = [
    '#f5f0e8', '#0a0a0d', '#ff2244', '#6c63ff', '#00fff7',
    '#aaff00', '#ff9900', '#ff69b4', '#00d4ff', '#ffd700',
    '#c084fc', '#34d399', '#fb923c', '#8b4513', '#1a3a5c',
]