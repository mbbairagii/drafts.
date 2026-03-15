import { Router } from 'express'
import { getPages, addPage, updatePage, deletePage } from '../controllers/pageController'
import auth from '../middleware/auth'

const router = Router({ mergeParams: true })

router.get('/', auth, getPages)
router.post('/', auth, addPage)
router.put('/:pageId', auth, updatePage)
router.delete('/:pageId', auth, deletePage)

export default router
