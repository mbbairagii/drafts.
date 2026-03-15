import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export async function register(req: Request, res: Response): Promise<void> {
    try {
        const { email, password, username } = req.body
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password required' }); return
        }
        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) {
            res.status(409).json({ message: 'Email already in use' }); return
        }
        const hash = await bcrypt.hash(password, 12)
        const user = await User.create({ email: email.toLowerCase(), password: hash, username })
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' })
        res.status(201).json({ token, user: { _id: user._id, email: user.email, username: user.username } })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ message: 'Registration failed' })
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password required' }); return
        }
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' }); return
        }
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            res.status(401).json({ message: 'Invalid credentials' }); return
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' })
        res.json({ token, user: { _id: user._id, email: user.email, username: user.username } })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Login failed' })
    }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user) { res.status(404).json({ message: 'User not found' }); return }
        res.json({ _id: user._id, email: user.email, username: user.username })
    } catch {
        res.status(500).json({ message: 'Failed to get user' })
    }
}
