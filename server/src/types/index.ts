import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    username: string;
    passwordHash: string;
    createdAt: Date;
}

export interface ITextElement {
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
}

export interface IStickerElement {
    id: string;
    emoji: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
}

export interface IImageElement {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IPage extends Document {
    _id: Types.ObjectId;
    diaryId: Types.ObjectId;
    theme: string;
    drawingData: string | null;
    textElements: ITextElement[];
    stickers: IStickerElement[];
    images: IImageElement[];
    pageIndex: number;
    createdAt: Date;
}

export interface IDiary extends Document {
    _id: Types.ObjectId;
    name: string;
    passwordHash: string | null;
    cover: string;
    userId: Types.ObjectId;
    pageCount: number;
    createdAt: Date;
    lastModified: Date;
}

export interface AuthRequest extends Request {
    user?: { id: string };
}