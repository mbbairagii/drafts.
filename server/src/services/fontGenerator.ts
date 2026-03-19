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
                    if (n.length >= 2) opPath.moveTo(n[0], n[1])
                    break
                case 'L': case 'l':
                    if (n.length >= 2) opPath.lineTo(n[0], n[1])
                    break
                case 'C': case 'c':
                    if (n.length >= 6) opPath.curveTo(n[0], n[1], n[2], n[3], n[4], n[5])
                    break
                case 'Q': case 'q':
                    if (n.length >= 4) opPath.quadraticCurveTo(n[0], n[1], n[2], n[3])
                    break
                case 'Z': case 'z':
                    opPath.close()
                    break
            }
        } catch {
            // skip malformed segment
        }
    }

    return opPath
}

function getRawBBox(d: string): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity

    const segments = d.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g) ?? []
    const nums = (str: string): number[] =>
        (str.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

    const trackXY = (x: number, y: number) => {
        if (isFinite(x)) { minX = Math.min(minX, x); maxX = Math.max(maxX, x) }
        if (isFinite(y)) { minY = Math.min(minY, y); maxY = Math.max(maxY, y) }
    }

    for (const seg of segments) {
        const cmd = seg[0]
        const n = nums(seg.slice(1))
        switch (cmd) {
            case 'M': case 'm': case 'L': case 'l':
                if (n.length >= 2) trackXY(n[0], n[1])
                break
            case 'C': case 'c':
                if (n.length >= 6) { trackXY(n[0], n[1]); trackXY(n[2], n[3]); trackXY(n[4], n[5]) }
                break
            case 'Q': case 'q':
                if (n.length >= 4) { trackXY(n[0], n[1]); trackXY(n[2], n[3]) }
                break
        }
    }

    return {
        minX: isFinite(minX) ? minX : 0,
        maxX: isFinite(maxX) ? maxX : 100,
        minY: isFinite(minY) ? minY : 0,
        maxY: isFinite(maxY) ? maxY : 100,
    }
}

export async function generateFont(imagePath: string): Promise<string> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drafts-font-'))

    try {
        // 1. Normalize sheet
        const normalizedPath = path.join(tmpDir, 'sheet.png')
        await sharp(imagePath)
            .resize(TEMPLATE_W, TEMPLATE_H, { fit: 'fill' })
            .greyscale()
            .normalise()
            .sharpen({ sigma: 1.5 })
            .png()
            .toFile(normalizedPath)

        console.log(`[FontGen] Sheet normalized. CELL_W=${CELL_W} CELL_H=${CELL_H}`)

        // 2. Extract + trace each glyph
        const glyphs: Glyph[] = []

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

                if (!rawD || rawD.length < 10) {
                    glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: '', advanceWidth: Math.round(cellW * (UPM / cellH)) })
                    continue
                }

                const moveCount = (rawD.match(/M/gi) ?? []).length
                if (moveCount <= 1 && rawD.length < 30) {
                    glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: '', advanceWidth: Math.round(cellW * (UPM / cellH)) })
                    continue
                }

                const rawBbox = getRawBBox(rawD)
                const inkW = rawBbox.maxX - rawBbox.minX
                const inkH = rawBbox.maxY - rawBbox.minY

                // ✅ ONLY CHANGE: lowercase gets x-height (~52%), uppercase+numbers get cap-height (~72%)
                const isUppercase = ch >= 'A' && ch <= 'Z'
                const isNumber = ch >= '0' && ch <= '9'
                const targetHeight = isUppercase || isNumber ? UPM * 0.72 : UPM * 0.52
                const scaleToUPM = targetHeight / inkH

                const normalizedD = normalizeSVGPath(
                    rawD,
                    rawBbox.minX,
                    rawBbox.maxY,
                    scaleToUPM,
                )

                if (!normalizedD || normalizedD.trim().length < 5) {
                    glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: '', advanceWidth: Math.round(inkW * scaleToUPM) })
                    continue
                }

                const sideBearing = Math.round(UPM * 0.03)
                const advanceWidth = Math.max(
                    Math.round(inkW * scaleToUPM + sideBearing * 2),
                    Math.round(UPM * 0.18)
                )

                console.log(`[FontGen] '${ch}' ✓ inkW=${Math.round(inkW)} inkH=${Math.round(inkH)} scale=${scaleToUPM.toFixed(3)} advW=${advanceWidth}`)
                glyphs.push({
                    char: ch,
                    codepoint: ch.charCodeAt(0),
                    svgPath: normalizedD,
                    advanceWidth,
                })
            } catch (e) {
                console.warn(`[FontGen] Exception on '${ch}':`, e)
                glyphs.push({ char: ch, codepoint: ch.charCodeAt(0), svgPath: '', advanceWidth: Math.round(CELL_W * (UPM / CELL_H)) })
            }
        }

        // 3. Summary
        const validGlyphs = glyphs.filter(g => g.svgPath && g.svgPath.trim().length > 0)
        const emptyGlyphs = glyphs.filter(g => !g.svgPath || g.svgPath.trim().length === 0)

        console.log(`[FontGen] ✅ Valid glyphs: ${validGlyphs.length} / ${glyphs.length}`)
        if (emptyGlyphs.length > 0)
            console.log(`[FontGen] ⚠️  Skipped: ${emptyGlyphs.map(g => g.char).join(', ')}`)

        if (validGlyphs.length === 0)
            throw new Error('No glyphs extracted. Check image quality or cell alignment.')

        // 4. Build font with opentype.js
        const notdefGlyph = new opentype.Glyph({
            name: '.notdef',
            unicode: 0,
            advanceWidth: UPM,
            path: new opentype.Path(),
        })

        const spaceGlyph = new opentype.Glyph({
            name: 'space',
            unicode: 0x20,
            advanceWidth: Math.round(UPM * 0.22),
            path: new opentype.Path(),
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

        // 5. Export to base64 TTF
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
        const cmd = seg[0]
        const n = nums(seg.slice(1))

        try {
            switch (cmd) {
                case 'M': case 'm': {
                    const x = sx(n[0]); const y = sy(n[1])
                    if (x !== null && y !== null) out.push(`M${x},${y}`)
                    break
                }
                case 'L': case 'l': {
                    const x = sx(n[0]); const y = sy(n[1])
                    if (x !== null && y !== null) out.push(`L${x},${y}`)
                    break
                }
                case 'C': case 'c': {
                    const c = [sx(n[0]), sy(n[1]), sx(n[2]), sy(n[3]), sx(n[4]), sy(n[5])]
                    if (c.every(v => v !== null)) out.push(`C${c.join(',')}`)
                    break
                }
                case 'Q': case 'q': {
                    const c = [sx(n[0]), sy(n[1]), sx(n[2]), sy(n[3])]
                    if (c.every(v => v !== null)) out.push(`Q${c.join(',')}`)
                    break
                }
                case 'Z': case 'z':
                    out.push('Z')
                    break
            }
        } catch {
            // skip malformed segment
        }
    }

    return out.join(' ')
}
