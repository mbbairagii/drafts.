import { Response } from 'express';
import { Types } from 'mongoose';
import Page from '../models/Page';
import Diary from '../models/Diary';
import { AuthRequest } from '../middleware/auth';

function oid(id: string | string[]): Types.ObjectId {
    return new Types.ObjectId(Array.isArray(id) ? id[0] : id);
}

export async function getPages(req: AuthRequest, res: Response): Promise<void> {
    const diary = await Diary.findOne({ _id: oid(req.params.diaryId), userId: req.userId });
    if (!diary) { res.status(404).json({ message: 'Diary not found' }); return; }
    const pages = await Page.find({ diaryId: oid(req.params.diaryId) }).sort({ pageIndex: 1 });
    res.status(200).json({ pages });
}

export async function addPage(req: AuthRequest, res: Response): Promise<void> {
    const diaryId = oid(req.params.diaryId);
    const diary = await Diary.findOne({ _id: diaryId, userId: req.userId });
    if (!diary) { res.status(404).json({ message: 'Diary not found' }); return; }
    const count = await Page.countDocuments({ diaryId });
    const page = await Page.create({ diaryId, theme: req.body.theme || 'aged', pageIndex: count, drawingData: null, textElements: [], stickers: [], images: [] });
    await Diary.findByIdAndUpdate(diaryId, { pageCount: count + 1, lastModified: new Date() });
    res.status(201).json({ page });
}

export async function updatePage(req: AuthRequest, res: Response): Promise<void> {
    const diaryId = oid(req.params.diaryId);
    const diary = await Diary.findOne({ _id: diaryId, userId: req.userId });
    if (!diary) { res.status(403).json({ message: 'Forbidden' }); return; }
    const page = await Page.findOneAndUpdate(
        { _id: oid(req.params.pageId), diaryId },
        { ...req.body },
        { new: true }
    );
    if (!page) { res.status(404).json({ message: 'Page not found' }); return; }
    await Diary.findByIdAndUpdate(diaryId, { lastModified: new Date() });
    res.status(200).json({ page });
}

export async function deletePage(req: AuthRequest, res: Response): Promise<void> {
    const diaryId = oid(req.params.diaryId);
    const diary = await Diary.findOne({ _id: diaryId, userId: req.userId });
    if (!diary) { res.status(403).json({ message: 'Forbidden' }); return; }
    await Page.findOneAndDelete({ _id: oid(req.params.pageId), diaryId });
    const remaining = await Page.countDocuments({ diaryId });
    await Diary.findByIdAndUpdate(diaryId, { pageCount: remaining, lastModified: new Date() });
    res.status(200).json({ message: 'Deleted' });
}