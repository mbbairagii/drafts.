import { Schema, model, Types } from 'mongoose';
import type { IDiary } from '../types';

const DiarySchema = new Schema<IDiary>({
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, default: null },
    cover: { type: String, required: true, default: 'obsidian' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pageCount: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
});

export default model<IDiary>('Diary', DiarySchema);