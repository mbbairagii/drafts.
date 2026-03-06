import { Schema, model } from 'mongoose';
import type { IPage } from '../types';

const PageSchema = new Schema<IPage>({
    diaryId: { type: Schema.Types.ObjectId, ref: 'Diary', required: true },
    theme: { type: String, default: 'aged' },
    drawingData: { type: String, default: null },
    textElements: { type: [], default: [] },
    stickers: { type: [], default: [] },
    images: { type: [], default: [] },
    pageIndex: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export default model<IPage>('Page', PageSchema);