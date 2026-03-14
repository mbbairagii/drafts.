import { Response } from 'express';
import bcrypt from 'bcryptjs';
import Diary from '../models/Diary';
import Page from '../models/Page';
import { AuthRequest } from '../middleware/auth';

export async function getDiaries(req: AuthRequest, res: Response): Promise<void> {
    const diaries = await Diary.find({ userId: req.userId }).sort({ lastModified: -1 });
    res.status(200).json({ diaries });
}

export async function createDiary(req: AuthRequest, res: Response): Promise<void> {
    const { name, password, cover } = req.body;
    if (!name) { res.status(400).json({ message: 'Name required' }); return; }
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const diary = await Diary.create({ name, passwordHash, cover: cover || 'obsidian', userId: req.userId, pageCount: 1 });
    await Page.create({ diaryId: diary._id, theme: 'aged', pageIndex: 0, drawingData: null, textElements: [], stickers: [], images: [] });
    res.status(201).json({ diary });
}

export async function getDiary(req: AuthRequest, res: Response): Promise<void> {
    const diary = await Diary.findOne({ _id: req.params.id, userId: req.userId });
    if (!diary) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json({ diary });
}

export async function updateDiary(req: AuthRequest, res: Response): Promise<void> {
    const { name, cover } = req.body;
    const diary = await Diary.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { name, cover, lastModified: new Date() },
        { returnDocument: 'after' }
    );
    if (!diary) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json({ diary });
}

export async function deleteDiary(req: AuthRequest, res: Response): Promise<void> {
    const diary = await Diary.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!diary) { res.status(404).json({ message: 'Not found' }); return; }
    await Page.deleteMany({ diaryId: req.params.id });
    res.status(200).json({ message: 'Deleted' });
}

export async function unlockDiary(req: AuthRequest, res: Response): Promise<void> {
    const { password } = req.body;
    const diary = await Diary.findOne({ _id: req.params.id, userId: req.userId });
    if (!diary) { res.status(404).json({ message: 'Not found' }); return; }
    if (!diary.passwordHash) { res.status(200).json({ unlocked: true }); return; }
    const valid = await bcrypt.compare(password, diary.passwordHash);
    if (!valid) { res.status(401).json({ unlocked: false, message: 'Wrong password' }); return; }
    res.status(200).json({ unlocked: true });
}
