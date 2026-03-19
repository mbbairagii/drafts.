import { Router } from 'express'
import multer from 'multer'
import * as path from 'path'
import * as os from 'os'
import { generateFont } from '../services/fontGenerator'

const router = Router()

const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (_, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
        cb(null, allowed.includes(file.mimetype))
    },
})

router.post('/generate', upload.single('sheet'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' })
    }

    try {
        const fontData = await generateFont(req.file.path)
        res.json({ fontData })
    } catch (err: any) {
        console.error('[FontGen]', err)
        res.status(500).json({ error: err.message || 'Font generation failed' })
    }
})

export default router
