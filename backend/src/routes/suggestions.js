import express from 'express';
import { getSuggestions, getSuggestionById, updateSuggestionStatus } from '../controllers/suggestionController.js';

const router = express.Router();

router.get('/', getSuggestions);
router.get('/:id', getSuggestionById);
router.patch('/:id/status', updateSuggestionStatus);

export default router;
