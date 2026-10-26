import express from 'express';
import {
  getPublishedEvents,
  getPublishedEventBySlug,
  getAdminEvents,
  getAdminEventById,
  createEvent,
  updateEvent,
  togglePublishEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── Public Routes ──────────────────────────────────────────────────────────
router.get('/', getPublishedEvents);
router.get('/slug/:slug', getPublishedEventBySlug);

// ── Admin Protected Routes ────────────────────────────────────────────────
router.get('/admin/all', protect, authorize('SUPER_ADMIN', 'ADMIN'), getAdminEvents);
router.get('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), getAdminEventById);
router.post('/admin', protect, authorize('SUPER_ADMIN', 'ADMIN'), createEvent);
router.put('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updateEvent);
router.patch('/admin/:id/publish', protect, authorize('SUPER_ADMIN', 'ADMIN'), togglePublishEvent);
router.put('/admin/:id/publish', protect, authorize('SUPER_ADMIN', 'ADMIN'), togglePublishEvent);
router.delete('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), deleteEvent);

// Public slug route fallback (after admin routes)
router.get('/:slug', getPublishedEventBySlug);

export default router;
