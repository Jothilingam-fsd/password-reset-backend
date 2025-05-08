import express from 'express';
import { forgotPassword, verifyToken, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', verifyToken);
router.post('/reset-password/:token', resetPassword);

export default router;
