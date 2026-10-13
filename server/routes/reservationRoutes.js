import express from 'express';
import {
  getReservations,
  updateReservation,
  updateSeatStatus,
  createFreeTrial,
  createWhatsAppLead,
  createTourBooking,
} from '../controllers/reservationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/free-trial', createFreeTrial);
router.post('/whatsapp-lead', createWhatsAppLead);
router.post('/tour', createTourBooking);

// Admin-only protected routes
router.get('/', protect, getReservations);
router.patch('/:id', protect, updateReservation);
router.post('/seats/status', protect, updateSeatStatus);

export default router;
