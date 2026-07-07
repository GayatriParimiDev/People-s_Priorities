import express from 'express';
import { 
  getLoginPage, 
  googleLogin, 
  googleCallback, 
  mockLogin,
  login,
  signup,
  getMe,
  logout,
  updateProfile
} from '../controllers/authController.js';

const router = express.Router();

// Serve the aesthetic login landing page
router.get('/login', getLoginPage);

// Redirects client browser to Google Authorization Server
router.get('/google', googleLogin);

// Redirect target for Google OAuth Callback
router.get('/google/callback', googleCallback);

// Developer Mock Bypass login (tests database writes and redirects to UI)
router.get('/mock', mockLogin);

// POST standard credentials/seed login
router.post('/login', login);

// POST standard signup
router.post('/signup', signup);

// GET currently logged-in user profile
router.get('/me', getMe);

// POST terminate session
router.post('/logout', logout);

// POST update user profile details
router.post('/profile/update', updateProfile);

export default router;
