export function generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function formatDate(ts: number | string): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max)
}