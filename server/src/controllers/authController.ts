import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

function signToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' } as jwt.SignOptions);
}

export async function register(req: Request, res: Response): Promise<void> {
    const { email, username, password } = req.body;
    if (!email || !username || !password) { res.status(400).json({ message: 'All fields required' }); return; }
    const exists = await User.findOne({ email });
    if (exists) { res.status(409).json({ message: 'Email already in use' }); return; }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, username, passwordHash });
    const token = signToken(user._id.toString());
    res.status(201).json({ token, user: { id: user._id, email: user.email, username: user.username } });
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ message: 'All fields required' }); return; }
    const user = await User.findOne({ email });
    if (!user) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    const token = signToken(user._id.toString());
    res.status(200).json({ token, user: { id: user._id, email: user.email, username: user.username } });
}

export async function getMe(req: Request & { userId?: string }, res: Response): Promise<void> {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.status(200).json({ user });
}