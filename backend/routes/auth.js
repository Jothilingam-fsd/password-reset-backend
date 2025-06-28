import express from 'express';
import {
  signup,
  forgotPassword,
  verifyToken,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup); 
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:userId/:token', verifyToken);
router.post('/reset-password/:userId/:token', resetPassword);

export default router;
