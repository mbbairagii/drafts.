import { Router } from 'express';
import { getDiaries, createDiary, getDiary, updateDiary, deleteDiary, unlockDiary } from '../controllers/diaryController';
import auth from '../middleware/auth';

const router = Router();
router.use(auth);
router.get('/', getDiaries);
router.post('/', createDiary);
router.get('/:id', getDiary);
router.patch('/:id', updateDiary);
router.delete('/:id', deleteDiary);
router.post('/:id/unlock', unlockDiary);
export default router;