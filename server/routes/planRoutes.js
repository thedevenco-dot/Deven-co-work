import express from 'express';
import {
  getActivePlans,
  getAllPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── Public Routes ──────────────────────────────────────────────────────────
// GET /api/plans -> Returns active plans
router.get('/', getActivePlans);

// ── Admin Protected Routes ────────────────────────────────────────────────
// GET /api/plans/admin -> Returns all plans (for admin management)
router.get('/admin', protect, authorize('SUPER_ADMIN', 'ADMIN'), getAllPlansAdmin);
router.post('/admin', protect, authorize('SUPER_ADMIN', 'ADMIN'), createPlan);
router.put('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updatePlan);
router.delete('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), deletePlan);

export default router;
