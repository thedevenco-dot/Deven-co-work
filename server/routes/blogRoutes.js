import express from 'express';
import {
  getPublishedPosts,
  getPublishedPostBySlug,
  getCategories,
  getAdminPosts,
  getAdminPostById,
  createPost,
  updatePost,
  togglePublishPost,
  deletePost,
  createOrUpdateCategory,
  deleteCategory,
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── Public Routes ──────────────────────────────────────────────────────────
router.get('/', getPublishedPosts);
router.get('/posts', getPublishedPosts);
router.get('/categories', getCategories);
router.get('/posts/:slug', getPublishedPostBySlug);

// ── Admin Protected Routes ────────────────────────────────────────────────
router.get('/admin/posts', protect, authorize('SUPER_ADMIN', 'ADMIN'), getAdminPosts);
router.get('/admin/posts/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), getAdminPostById);
router.post('/admin/posts', protect, authorize('SUPER_ADMIN', 'ADMIN'), createPost);
router.put('/admin/posts/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updatePost);
router.patch('/admin/posts/:id/publish', protect, authorize('SUPER_ADMIN', 'ADMIN'), togglePublishPost);
router.put('/admin/posts/:id/publish', protect, authorize('SUPER_ADMIN', 'ADMIN'), togglePublishPost);
router.delete('/admin/posts/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), deletePost);

router.post('/admin/categories', protect, authorize('SUPER_ADMIN', 'ADMIN'), createOrUpdateCategory);
router.delete('/admin/categories/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), deleteCategory);

// Public slug route fallback (after admin routes)
router.get('/:slug', getPublishedPostBySlug);

export default router;
