import express from 'express';
import { 
  categorizeSuggestions,
  triggerWorker,
  getRecommendation,
  getSchemes,
  getAnomalies,
  getBudgetOptimization,
  getMeetingBriefs,
  getQuarterlyReport,
  statusChat,
  conversationalSubmission,
  duplicateCheck
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/categorize', categorizeSuggestions);
router.get('/trigger', triggerWorker);
router.get('/recommendations/:proposal_id', getRecommendation);
router.get('/schemes/:proposal_id', getSchemes);
router.get('/anomalies', getAnomalies);
router.get('/budget-optimization/:constituency_id', getBudgetOptimization);
router.get('/meetings/:constituency_id/briefs', getMeetingBriefs);
router.get('/reports/:constituency_id/quarterly', getQuarterlyReport);
router.post('/status-chat', statusChat);
router.post('/conversational-submission', conversationalSubmission);
router.post('/duplicate-check', duplicateCheck);

export default router;

