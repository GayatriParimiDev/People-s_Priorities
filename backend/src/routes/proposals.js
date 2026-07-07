import express from 'express';
import { 
  getProposals, 
  getProposalById, 
  submitProposalAction, 
  getAuditTrail, 
  explainRanking,
  getFundsLedger,
  matchScheme,
  getDashboardStats,
  getBiasFlags,
  generateReport,
  draftResponse,
  recommendProposal,
  getConstituencies
} from '../controllers/proposalController.js';

const router = express.Router();

router.get('/', getProposals);
router.get('/constituencies', getConstituencies);
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/bias-flags', getBiasFlags);
router.get('/funds', getFundsLedger);
router.get('/scheme-match', matchScheme);
router.get('/reports/generate', generateReport);
router.get('/:id', getProposalById);
router.post('/:id/action', submitProposalAction);
router.get('/:id/audit-trail', getAuditTrail);
router.patch('/:id/recommend', recommendProposal);
router.post('/:id/explain-ranking', explainRanking);
router.post('/:id/draft-response', draftResponse);

export default router;
