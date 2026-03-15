import mongoose, { Schema, Document } from 'mongoose'

export interface IDiary extends Document {
    userId: mongoose.Types.ObjectId
    name: string
    cover: string
    passwordHash?: string
    coverStickers?: any[]
    createdAt: Date
    updatedAt: Date
}

const DiarySchema = new Schema<IDiary>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    cover: { type: String, default: 'midnight' },
    passwordHash: { type: String },
    coverStickers: { type: Array, default: [] },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
})

export default mongoose.model<IDiary>('Diary', DiarySchema)
