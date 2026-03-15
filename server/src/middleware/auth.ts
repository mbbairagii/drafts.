import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export default function auth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' }); return
    }
    const token = header.split(' ')[1]
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        req.userId = decoded.userId
        next()
    } catch {
        res.status(401).json({ message: 'Invalid token' }); return
    }
}
