import express from 'express';
import { getPriorityProjects } from '../controllers/rankingController.js';

const router = express.Router();

// GET /api/ranking?constituency_id=...
router.get('/priorities', getPriorityProjects);

export default router;
