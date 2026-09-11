import express from 'express';
import { loginUser, getProfile } from '../controllers/authController.js';
import { verifyToken, loginRateLimiter } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginRateLimiter, loginUser);
router.get('/profile', verifyToken, getProfile);

export default router;
