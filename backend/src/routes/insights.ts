import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  generateInsights,
  getInsights,
  markInsightRead,
} from '../controllers/insightController';

const router = Router();

// All insight routes require login
router.use(verifyToken);

// Generate insights
router.post('/generate', generateInsights);

// Get insights
router.get('/', getInsights);

// Mark insight as read
router.put('/:id/read', markInsightRead);

export default router;
