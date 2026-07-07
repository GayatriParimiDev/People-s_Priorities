import express from 'express';
import { getDashboard, upvoteSuggestion, commentSuggestion, votePriorityPoll } from '../controllers/userController.js';

const router = express.Router();

router.get('/dashboard', getDashboard);
router.post('/vote', upvoteSuggestion);
router.post('/comment', commentSuggestion);
router.post('/priority-poll', votePriorityPoll);

export default router;
