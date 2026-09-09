import express from 'express';
import { getConfig, submitLead } from '../controllers/calculatorController.js';

const router = express.Router();

router.get('/config', getConfig);
router.post('/leads', submitLead);

export default router;
