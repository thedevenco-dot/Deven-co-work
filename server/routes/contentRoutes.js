import express from 'express';
import {
  getPublishedContent,
  getDraftContent,
  saveDraftContent,
  publishContent,
  uploadFile,
  getMediaLibrary,
  updateMediaMeta,
  deleteMedia,
} from '../controllers/contentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/published', getPublishedContent);

// ── Protected CMS routes (Admin Only) ────────────────────────────────────
router.get('/draft', protect, getDraftContent);
router.post('/draft', protect, saveDraftContent);
router.post('/publish', protect, publishContent);
router.post('/upload', protect, uploadFile);

// ── Media library routes ───────────────────────────────────────────────────
router.get('/media', protect, getMediaLibrary);
router.patch('/media/:fileName', protect, updateMediaMeta);
router.delete('/media/:fileName', protect, deleteMedia);

export default router;
