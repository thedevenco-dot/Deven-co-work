import express from 'express';
import {
  createReservation,
  confirmReservation,
  failReservation,
  getReservations,
  updateReservation,
  retryCRMSync,
  updateSeatStatus,
  createFreeTrial,
  createWhatsAppLead,
} from '../controllers/reservationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createReservation);
router.post('/confirm', confirmReservation);
router.post('/fail', failReservation);
router.post('/free-trial', createFreeTrial);
router.post('/whatsapp-lead', createWhatsAppLead);

// Admin-only protected routes
router.get('/', protect, getReservations);
router.patch('/:id', protect, updateReservation);
router.post('/:id/sync', protect, retryCRMSync);
router.post('/seats/status', protect, updateSeatStatus);

export default router;
