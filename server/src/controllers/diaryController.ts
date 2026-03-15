import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'
import { AuthRequest } from '../middleware/auth'
import Diary from '../models/Diary'   

export async function getDiaries(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diaries = await Diary.find({ userId: new Types.ObjectId(req.userId!) }).sort({ updatedAt: -1 })
        res.json(diaries)
    } catch (e: any) {
        res.status(500).json({ message: 'Failed to fetch diaries' })
    }
}

export async function createDiary(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { name, cover, password } = req.body
        if (!name?.trim()) { res.status(400).json({ message: 'Name required' }); return }
        const data: Record<string, unknown> = {
            userId: new Types.ObjectId(req.userId!),
            name: name.trim(),
            cover: cover || 'midnight',
        }
        if (password) data.passwordHash = await bcrypt.hash(password, 12)
        const diary = await Diary.create(data)
        res.status(201).json(diary)
    } catch (e: any) {
        res.status(500).json({ message: 'Failed to create diary' })
    }
}

export async function getDiary(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diary = await Diary.findOne({ _id: new Types.ObjectId(req.params.id as string), userId: new Types.ObjectId(req.userId!) })
        if (!diary) { res.status(404).json({ message: 'Not found' }); return }
        res.json(diary)
    } catch {
        res.status(500).json({ message: 'Failed to fetch diary' })
    }
}

export async function updateDiary(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diary = await Diary.findOneAndUpdate(
            { _id: new Types.ObjectId(req.params.id as string), userId: new Types.ObjectId(req.userId!) },
            { ...req.body, updatedAt: new Date() },
            { returnDocument: 'after' }
        )
        if (!diary) { res.status(404).json({ message: 'Not found' }); return }
        res.json(diary)
    } catch {
        res.status(500).json({ message: 'Failed to update diary' })
    }
}

export async function deleteDiary(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diary = await Diary.findOneAndDelete({ _id: new Types.ObjectId(req.params.id as string), userId: new Types.ObjectId(req.userId!) })
        if (!diary) { res.status(404).json({ message: 'Not found' }); return }
        res.json({ message: 'Deleted' })
    } catch {
        res.status(500).json({ message: 'Failed to delete diary' })
    }
}

export async function unlockDiary(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { password } = req.body
        if (!password) { res.status(400).json({ message: 'Password required' }); return }
        const diary = await Diary.findOne({ _id: new Types.ObjectId(req.params.id as string), userId: new Types.ObjectId(req.userId!) })
        if (!diary) { res.status(404).json({ message: 'Not found' }); return }
        if (!diary.passwordHash) { res.json({ unlocked: true }); return }
        const valid = await bcrypt.compare(password, diary.passwordHash)
        if (!valid) { res.status(401).json({ message: 'Wrong password' }); return }
        res.json({ unlocked: true })
    } catch {
        res.status(500).json({ message: 'Failed to unlock' })
    }
}
