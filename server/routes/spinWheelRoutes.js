import express from 'express';
import {
  getConfig,
  spin,
  createLead,
} from '../controllers/spinWheelController.js';

const router = express.Router();

// Public routes for Spin Wheel standalone application
router.get('/config', getConfig);
router.post('/spin', spin);
router.post('/leads', createLead);

export default router;
