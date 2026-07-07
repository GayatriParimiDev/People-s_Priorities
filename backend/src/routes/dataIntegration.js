import express from 'express';
import { getIntegratedData } from '../controllers/dataIntegrationController.js';

const router = express.Router();

// GET /api/data-integration?constituency_id=...
router.get('/', getIntegratedData);

export default router;
