import { Router } from 'express';
import { getPages, addPage, updatePage, deletePage } from '../controllers/pageController';
import auth from '../middleware/auth';

const router = Router();
router.use(auth);
router.get('/:diaryId/pages', getPages);
router.post('/:diaryId/pages', addPage);
router.patch('/:diaryId/pages/:pageId', updatePage);
router.delete('/:diaryId/pages/:pageId', deletePage);
export default router;