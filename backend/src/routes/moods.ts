import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  createMood,
  getMoods,
  getMoodStats,
} from '../controllers/moodController';

const router = Router();

// All mood routes require authentication
router.use(verifyToken);

// POST /api/moods - Create new mood entry
router.post('/', createMood);

// GET /api/moods - Get user's mood history
router.get('/', getMoods);

// GET /api/moods/stats - Get mood statistics
router.get('/stats', getMoodStats); 

// GET /api/moods/:id - Get specific mood entry
//router.get('/:id', getMoodById);

// PUT /api/moods/:id - Update mood entry
//router.put('/:id', updateMood);

// DELETE /api/moods/:id - Delete mood entry
//router.delete('/:id', deleteMood);

export default router;
