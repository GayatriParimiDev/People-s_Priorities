import express from 'express';
import { getLedger, endorseProposal, submitProposal } from '../controllers/ledgerController.js';

const router = express.Router();

router.get('/', getLedger);
router.post('/endorse', endorseProposal);
router.post('/submit', submitProposal);

export default router;
