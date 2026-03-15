import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
    email: string
    password: string
    username?: string
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    username: { type: String, required: false },
    createdAt: { type: Date, default: () => new Date() },
})

export default mongoose.model<IUser>('User', UserSchema)
