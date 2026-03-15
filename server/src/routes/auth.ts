import { Router } from 'express'
import { register, login, getMe } from '../controllers/authController'
import auth from '../middleware/auth'

const router = Router()

router.post('/register', register)   // no auth
router.post('/login', login)      // no auth
router.get('/me', auth, getMe) // auth only here

export default router
