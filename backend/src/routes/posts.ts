import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  createPost,
  getPosts,
  getMyPosts,
  toggleLike,
  deletePost,
  reportPost,
} from '../controllers/postController';

const router = Router();

// All post routes require authentication
router.use(verifyToken);

// POST /api/posts - Create new post
router.post('/', createPost);

// GET /api/posts - Get all posts (paginated)
router.get('/', getPosts);

// GET /api/posts/my - Get user's posts
router.get('/my', getMyPosts);

// POST /api/posts/:id/like - Toggle like on post
router.post('/:id/like', toggleLike);

// DELETE /api/posts/:id - Delete post
router.delete('/:id', deletePost);

// POST /api/posts/:id/report - Report post
router.post('/:id/report', reportPost);

export default router;
