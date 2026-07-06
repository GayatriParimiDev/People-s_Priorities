import express from 'express';
import { getLoginPage, googleLogin, googleCallback, mockLogin } from '../controllers/authController.js';

const router = express.Router();

// Serve the aesthetic login landing page
router.get('/login', getLoginPage);

// Redirects client browser to Google Authorization Server
router.get('/google', googleLogin);

// Redirect target for Google OAuth Callback
router.get('/google/callback', googleCallback);

// Developer Mock Bypass login (tests database writes)
router.get('/mock', mockLogin);

export default router;
