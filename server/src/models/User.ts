import { Schema, model } from 'mongoose';
import type { IUser } from '../types';

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default model<IUser>('User', UserSchema);