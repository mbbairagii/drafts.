import mongoose, { Schema, Document } from 'mongoose'

const StickerElementSchema = new Schema({
    id: { type: String, required: true },
    emoji: { type: String, default: null },
    src: { type: String, default: null },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    size: { type: Number, required: true },
    rotation: { type: Number, required: true },
}, { _id: false })

const TextElementSchema = new Schema({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: { type: String, default: '' },
    fontSize: { type: Number, default: 18 },
    fontFamily: { type: String, default: 'Caveat' },
    color: { type: String, default: '#1a0f00' },
}, { _id: false })

const ImageElementSchema = new Schema({
    id: { type: String, required: true },
    src: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
}, { _id: false })

const PageSchema = new Schema({
    diaryId: { type: Schema.Types.ObjectId, ref: 'Diary', required: true },
    order: { type: Number, default: 0 },
    theme: { type: String, default: 'aged' },
    drawingData: { type: String, default: null },
    textElements: { type: [TextElementSchema], default: () => [] },
    stickers: { type: [StickerElementSchema], default: () => [] },
    images: { type: [ImageElementSchema], default: () => [] },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
})

export interface IPage extends Document {
    diaryId: mongoose.Types.ObjectId
    order: number
    theme: string
    drawingData?: string | null
    textElements: {
        id: string; x: number; y: number
        text: string; fontSize: number; fontFamily: string; color: string
    }[]
    stickers: {
        id: string; emoji?: string | null; src?: string | null
        x: number; y: number; size: number; rotation: number
    }[]
    images: {
        id: string; src: string
        x: number; y: number; width: number; height: number
    }[]
    createdAt: Date
    updatedAt: Date
}

export default mongoose.model<IPage>('Page', PageSchema)
