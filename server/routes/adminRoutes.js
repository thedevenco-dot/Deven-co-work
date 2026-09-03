import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getCapacityStats,
  updateCapacitySettings,
  createManualBooking,
  manageSeatState,
  getAmountSettings,
  updateAmountSettings,
  sendTestEmail,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply protect middleware to all admin routes
router.use(protect);

router.get('/capacity', authorize('SUPER_ADMIN', 'ADMIN'), getCapacityStats);
router.patch('/capacity', authorize('SUPER_ADMIN'), updateCapacitySettings);

router.get('/settings/amount', authorize('SUPER_ADMIN', 'ADMIN'), getAmountSettings);
router.put('/settings/amount', authorize('SUPER_ADMIN', 'ADMIN'), updateAmountSettings);

router.post('/bookings', authorize('SUPER_ADMIN', 'ADMIN'), createManualBooking);

router.post('/seats/:id/:action', authorize('SUPER_ADMIN', 'ADMIN'), manageSeatState);

router.post('/test-email', authorize('SUPER_ADMIN', 'ADMIN'), sendTestEmail);

export default router;

