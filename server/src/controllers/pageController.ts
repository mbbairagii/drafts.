import { Types } from 'mongoose'
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import Diary from '../models/Diary'
import Page from '../models/Page'

async function verifyDiaryOwner(diaryId: string, userId: string) {
    const diary = await Diary.findOne({
        _id: new Types.ObjectId(diaryId),
        userId: new Types.ObjectId(userId),
    })
    if (!diary) throw new Error('Diary not found or unauthorized')
    return diary
}

export async function getPages(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diaryId = req.params.diaryId as string
        await verifyDiaryOwner(diaryId, req.userId!)
        const pages = await Page.find({ diaryId: new Types.ObjectId(diaryId) }).sort({ order: 1 })
        res.json(pages)
    } catch (e: any) {
        console.error('getPages error:', e.message)
        res.status(500).json({ message: e.message })
    }
}

export async function addPage(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diaryId = req.params.diaryId as string
        await verifyDiaryOwner(diaryId, req.userId!)
        const count = await Page.countDocuments({ diaryId: new Types.ObjectId(diaryId) })
        const doc = new Page({
            diaryId: new Types.ObjectId(diaryId),
            theme: req.body.theme || 'aged',
            order: count,
        })
        await doc.save()
        res.status(201).json(doc)
    } catch (e: any) {
        console.error('addPage error:', e.message)
        res.status(500).json({ message: e.message })
    }
}

export async function updatePage(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diaryId = req.params.diaryId as string
        const pageId = req.params.pageId as string
        await verifyDiaryOwner(diaryId, req.userId!)
        const page = await Page.findByIdAndUpdate(
            new Types.ObjectId(pageId),
            req.body,
            { returnDocument: 'after' }
        )
        if (!page) { res.status(404).json({ message: 'Page not found' }); return }
        res.json(page)
    } catch (e: any) {
        console.error('updatePage error:', e.message)
        res.status(500).json({ message: e.message })
    }
}

export async function deletePage(req: AuthRequest, res: Response): Promise<void> {
    try {
        const diaryId = req.params.diaryId as string
        const pageId = req.params.pageId as string
        await verifyDiaryOwner(diaryId, req.userId!)
        await Page.findByIdAndDelete(new Types.ObjectId(pageId))
        res.json({ message: 'Deleted' })
    } catch (e: any) {
        console.error('deletePage error:', e.message)
        res.status(500).json({ message: e.message })
    }
}
