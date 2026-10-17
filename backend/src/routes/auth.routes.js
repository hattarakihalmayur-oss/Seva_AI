import { Router } from 'express';
import { register, login, getMe, updateProfile, generateOtp, verifyOtp } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter, registrationLimiter } from '../middleware/rateLimiters.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validate.middleware.js';

const router = Router();

// POST /api/auth/register — strict rate limit + validation
router.post('/register', registrationLimiter, validateRegister, register);

// POST /api/auth/login — brute-force protection + validation
router.post('/login', authLimiter, validateLogin, login);

// POST /api/auth/otp/generate — generate 6-digit OTP for mobile sign in
router.post('/otp/generate', authLimiter, generateOtp);

// POST /api/auth/otp/verify — verify OTP and issue JWT
router.post('/otp/verify', authLimiter, verifyOtp);

// GET  /api/auth/me — requires authentication
router.get('/me', protect, getMe);

// PUT  /api/auth/profile — requires authentication
router.put('/profile', protect, updateProfile);

export default router;
