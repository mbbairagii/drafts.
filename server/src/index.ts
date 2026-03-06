import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import diaryRoutes from './routes/diaries'
import pageRoutes from './routes/pages'

dotenv.config()

const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/diaries', diaryRoutes)
app.use('/api/diaries', pageRoutes)

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        console.log('MongoDB connected')
        app.listen(PORT, () => console.log(`drafts. server running on :${PORT}`))
    })
    .catch(err => console.error('DB connection failed:', err))