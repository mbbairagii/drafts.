import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'
import diaryRoutes from './routes/diaries'
import pageRoutes from './routes/pages'
import fontRouter from './routes/font'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '20mb' }))        // ← was default 100kb, now 20mb
app.use(express.urlencoded({ limit: '20mb', extended: true }))
app.use('/api/font', fontRouter)

app.use('/api/auth', authRoutes)
app.use('/api/diaries', diaryRoutes)
app.use('/api/diaries', pageRoutes)

mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err))

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server on port ${PORT}`))
