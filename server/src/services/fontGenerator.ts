import sharp from 'sharp'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import opentype from 'opentype.js'

const Potrace = require('potrace')

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
const COLS = 6
const ROWS = Math.ceil(CHARS.length / COLS)
const TEMPLATE_W = 1920
const TEMPLATE_H = 3700
const MARGIN_X = 80
const MARGIN_Y = 180
const CELL_W = Math.floor((TEMPLATE_W - MARGIN_X * 2) / COLS)
const CELL_H = Math.floor((TEMPLATE_H - MARGIN_Y - 60) / ROWS)
const CELL_PAD = 18
const UPM = 1000
const ASCENDER = 800
const DESCENDER = -200

interface GlyphRaw {
    char: string
    codepoint: number
    rawD: string
    inkW: number
    inkH: number
    rawBbox: { minX: number; maxX: number; minY: number; maxY: number }
}

interface Glyph {
    char: string
    codepoint: number
    svgPath: string
    advanceWidth: number
}

function traceFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        Potrace.trace(filePath, {
            background: '#ffffff',
            color: '#000000',
            threshold: 128,
            turdSize: 2,
            alphaMax: 1.0,
            optCurve: true,
            optTolerance: 0.2,
        }, (err: Error | null, svg: string) => {
            if (err) reject(err)
            else resolve(svg)
        })
    })
}

function svgPathToOpentypePath(d: string): opentype.Path {
    const opPath = new opentype.Path()
    const segments = d.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g) ?? []
    const nums = (str: string): number[] =>
        (str.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

    for (const seg of segments) {
        const cmd = seg[0]
        const n = nums(seg.slice(1))
        try {
            switch (cmd) {
                case 'M': case 'm':
                    if (n.length >= 2) opPath.moveTo(n[0], n[1]); break
                case 'L': case 'l':
                    if (n.length >= 2) opPath.lineTo(n[0], n[1]); break
                case 'C': case 'c':
                    if (n.length >= 6) opPath.curveTo(n[0], n[1], n[2], n[3], n[4], n[5]); break
                case 'Q': case 'q':
                    if (n.length >= 4) opPath.quadraticCurveTo(n[0], n[1], n[2], n[3]); break
                case 'Z': case 'z':
                    opPath.close(); break
            }
        } catch { }
    }
    return opPath
}

function getRawBBox(d: string): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    const segments = d.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g) ?? []
    const nums = (str: string): number[] =>
        (str.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
    const track = (x: number, y: number) => {
        if (isFinite(x)) { minX = Math.min(minX, x); maxX = Math.max(maxX, x) }
        if (isFinite(y)) { minY = Math.min(minY, y); maxY = Math.max(maxY, y) }
    }
    for (const seg of segments) {
        const cmd = seg[0]; const n = nums(seg.slice(1))
        switch (cmd) {
            case 'M': case 'm': case 'L': case 'l':
                if (n.length >= 2) track(n[0], n[1]); break
            case 'C': case 'c':
                if (n.length >= 6) { track(n[0], n[1]); track(n[2], n[3]); track(n[4], n[5]) }; break
            case 'Q': case 'q':
                if (n.length >= 4) { track(n[0], n[1]); track(n[2], n[3]) }; break
        }
    }
    return {
        minX: isFinite(minX) ? minX : 0,
        maxX: isFinite(maxX) ? maxX : 100,
        minY: isFinite(minY) ? minY : 0,
        maxY: isFinite(maxY) ? maxY : 100,
    }
}

function getMedianHeight(chars: string[], heightMap: Map<string, number>): number {
    const heights = chars
        .map(ch => heightMap.get(ch))
        .filter((h): h is number => h !== undefined && h > 0)
    if (!heights.length) return 100
    heights.sort((a, b) => a - b)
    return heights[Math.floor(heights.length / 2)]
}

export async function generateFont(imagePath: string): Promise<string> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drafts-font-'))

    try {
        const normalizedPath = path.join(tmpDir, 'sheet.png')
        await sharp(imagePath)
            .resize(TEMPLATE_W, TEMPLATE_H, { fit: 'fill' })
            .greyscale()
            .normalise()
            .sharpen({ sigma: 1.5 })
            .png()
            .toFile(normalizedPath)

        console.log(`[FontGen] Sheet normalized. CELL_W=${CELL_W} CELL_H=${CELL_H}`)

        // ── Phase 1: extract raw glyph data ──────────────────────────────
        const rawGlyphs = new Map<string, GlyphRaw>()

        for (let i = 0; i < CHARS.length; i++) {
            const ch = CHARS[i]
            const col = i % COLS
            const row = Math.floor(i / COLS)
            const cellX = Math.round(MARGIN_X + col * CELL_W + CELL_PAD)
            const cellY = Math.round(MARGIN_Y + row * CELL_H + CELL_PAD)
            const cellW = CELL_W - CELL_PAD * 2
            const cellH = CELL_H - CELL_PAD * 2
            const cellPath = path.join(tmpDir, `cell_${i}.png`)

            try {
                await sharp(normalizedPath)
                    .extract({ left: cellX, top: cellY, width: cellW, height: cellH })
                    .greyscale()
                    .threshold(128)
                    .png()
                    .toFile(cellPath)

                const svgString = await traceFile(cellPath)
                const match = svgString.match(/\sd\s*=\s*"([^"]+)"/)
                const rawD = match?.[1]?.trim() ?? ''

                if (!rawD || rawD.length < 10) continue
                const moveCount = (rawD.match(/M/gi) ?? []).length
                if (moveCount <= 1 && rawD.length < 30) continue

                const bbox = getRawBBox(rawD)
                const inkW = bbox.maxX - bbox.minX
                const inkH = bbox.maxY - bbox.minY
                if (inkH <= 0 || inkW <= 0) continue

                rawGlyphs.set(ch, { char: ch, codepoint: ch.charCodeAt(0), rawD, inkW, inkH, rawBbox: bbox })
            } catch (e) {
                console.warn(`[FontGen] Exception on '${ch}':`, e)
            }
        }

        // ── Phase 2: compute ONE shared scale per category ───────────────
        // Using median ink height so outliers (stray marks) don't skew the scale
        const lowercase = 'abcdefghijklmnopqrstuvwxyz'.split('')
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        const numbers = '0123456789'.split('')

        const heightMap = new Map<string, number>()
        rawGlyphs.forEach((g, ch) => heightMap.set(ch, g.inkH))

        const lcMedian = getMedianHeight(lowercase, heightMap)
        const ucMedian = getMedianHeight(uppercase, heightMap)
        const numMedian = getMedianHeight(numbers, heightMap)

        // All three categories share the same UPM target — scale derived from median
        const lcScale = (UPM * 0.52) / lcMedian
        const ucScale = (UPM * 0.72) / ucMedian
        const numScale = (UPM * 0.72) / numMedian

        console.log(`[FontGen] Median heights — lc:${Math.round(lcMedian)} uc:${Math.round(ucMedian)} num:${Math.round(numMedian)}`)
        console.log(`[FontGen] Scales — lc:${lcScale.toFixed(3)} uc:${ucScale.toFixed(3)} num:${numScale.toFixed(3)}`)

        // ── Phase 3: build final glyphs using shared scale ───────────────
        const glyphs: Glyph[] = []

        for (const ch of CHARS) {
            const raw = rawGlyphs.get(ch)
            if (!raw) {
                glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: '', advanceWidth: Math.round(CELL_W * (UPM / CELL_H)) })
                continue
            }

            const isUppercase = ch >= 'A' && ch <= 'Z'
            const isNumber = ch >= '0' && ch <= '9'
            // ✅ KEY FIX: use shared category scale, not per-glyph scale
            const scale = isUppercase ? ucScale : isNumber ? numScale : lcScale

            const normalizedD = normalizeSVGPath(raw.rawD, raw.rawBbox.minX, raw.rawBbox.maxY, scale)
            if (!normalizedD || normalizedD.trim().length < 5) {
                glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: '', advanceWidth: Math.round(raw.inkW * scale) })
                continue
            }

            const sideBearing = Math.round(UPM * 0.03)
            const advanceWidth = Math.max(
                Math.round(raw.inkW * scale + sideBearing * 2),
                Math.round(UPM * 0.18)
            )

            console.log(`[FontGen] '${ch}' ✓ inkH=${Math.round(raw.inkH)} scale=${scale.toFixed(3)} advW=${advanceWidth}`)
            glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: normalizedD, advanceWidth })
        }

        // ── Phase 4: assemble font ────────────────────────────────────────
        const validGlyphs = glyphs.filter(g => g.svgPath && g.svgPath.trim().length > 0)
        const emptyGlyphs = glyphs.filter(g => !g.svgPath || g.svgPath.trim().length === 0)

        console.log(`[FontGen] ✅ Valid glyphs: ${validGlyphs.length} / ${glyphs.length}`)
        if (emptyGlyphs.length > 0)
            console.log(`[FontGen] ⚠️  Skipped: ${emptyGlyphs.map(g => g.char).join(', ')}`)

        if (validGlyphs.length === 0)
            throw new Error('No glyphs extracted. Check image quality or cell alignment.')

        const notdefGlyph = new opentype.Glyph({
            name: '.notdef', unicode: 0, advanceWidth: UPM, path: new opentype.Path(),
        })
        const spaceGlyph = new opentype.Glyph({
            name: 'space', unicode: 0x20, advanceWidth: Math.round(UPM * 0.22), path: new opentype.Path(),
        })
        const otGlyphs = validGlyphs.map(g =>
            new opentype.Glyph({
                name: g.char,
                unicode: g.codepoint,
                advanceWidth: g.advanceWidth,
                path: svgPathToOpentypePath(g.svgPath),
            })
        )

        const font = new opentype.Font({
            familyName: 'MyHandwriting',
            styleName: 'Regular',
            unitsPerEm: UPM,
            ascender: ASCENDER,
            descender: DESCENDER,
            glyphs: [notdefGlyph, spaceGlyph, ...otGlyphs],
        })

        const arrayBuffer = font.toArrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        console.log(`[FontGen] ✅ Font generated. Size: ${arrayBuffer.byteLength} bytes`)
        return base64

    } finally {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { }
    }
}

function sanitizeNum(n: number): number | null {
    if (!isFinite(n) || isNaN(n)) return null
    return Math.max(-32768, Math.min(32767, Math.round(n * 10) / 10))
}

function normalizeSVGPath(d: string, minX: number, baselineY: number, scale: number): string {
    const segments = d.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g) ?? []
    const out: string[] = []
    const sx = (x: number): number | null => sanitizeNum((x - minX) * scale)
    const sy = (y: number): number | null => sanitizeNum((baselineY - y) * scale)
    const nums = (str: string): number[] =>
        (str.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

    for (const seg of segments) {
        const cmd = seg[0]; const n = nums(seg.slice(1))
        try {
            switch (cmd) {
                case 'M': case 'm': { const x = sx(n[0]); const y = sy(n[1]); if (x !== null && y !== null) out.push(`M${x},${y}`); break }
                case 'L': case 'l': { const x = sx(n[0]); const y = sy(n[1]); if (x !== null && y !== null) out.push(`L${x},${y}`); break }
                case 'C': case 'c': { const c = [sx(n[0]), sy(n[1]), sx(n[2]), sy(n[3]), sx(n[4]), sy(n[5])]; if (c.every(v => v !== null)) out.push(`C${c.join(',')}`); break }
                case 'Q': case 'q': { const c = [sx(n[0]), sy(n[1]), sx(n[2]), sy(n[3])]; if (c.every(v => v !== null)) out.push(`Q${c.join(',')}`); break }
                case 'Z': case 'z': out.push('Z'); break
            }
        } catch { }
    }
    return out.join(' ')
}
