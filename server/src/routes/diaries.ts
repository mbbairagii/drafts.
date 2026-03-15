import { Router } from 'express'
import auth from '../middleware/auth'
import { getDiaries, createDiary, getDiary, updateDiary, deleteDiary, unlockDiary } from '../controllers/diaryController'
import { getPages, addPage, updatePage, deletePage } from '../controllers/pageController'

const router = Router()
router.use(auth)

router.get('/', getDiaries)
router.post('/', createDiary)
router.get('/:id', getDiary)
router.put('/:id', updateDiary)
router.delete('/:id', deleteDiary)
router.post('/:id/unlock', unlockDiary)

router.get('/:diaryId/pages', getPages)
router.post('/:diaryId/pages', addPage)
router.patch('/:diaryId/pages/:pageId', updatePage)
router.delete('/:diaryId/pages/:pageId', deletePage)

export default router
