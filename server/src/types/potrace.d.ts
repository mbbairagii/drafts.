declare module 'potrace' {
    interface PotraceOptions {
        background?: string
        color?: string
        threshold?: number
        turdSize?: number
        alphaMax?: number
        optCurve?: boolean
        optTolerance?: number
    }
    export function trace(file: string, opts: PotraceOptions, cb: (err: Error | null, svg: string) => void): void
    export function trace(file: string, cb: (err: Error | null, svg: string) => void): void
}
