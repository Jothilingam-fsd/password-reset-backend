// controllers/authController.js
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import nodemailer from 'nodemailer';

import User from '../models/User.js';

import ResetToken from '../models/resetToken.js'

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


// POST /api/auth/forgot
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User with that email not found' });
    }

    // Generate a secure random token (32 bytes hex string):contentReference[oaicite:8]{index=8}
    const token = crypto.randomBytes(32).toString('hex');
    // Save token to DB with userId and 1h expiry (handled by schema)
    await new ResetToken({ userId: user._id, token }).save();

    // Construct reset URL. CLIENT_URL is base of frontend app.
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`;

    // Configure Nodemailer transporter (using Gmail example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. If you did not request this, please ignore.</p>`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/reset/:userId/:token
export const verifyToken = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const tokenDoc = await ResetToken.findOne({ userId, token });
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }
    // Token is valid
    return res.json({ message: 'Token is valid' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/reset/:userId/:token
export const resetPassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { newPassword } = req.body;
    // Find token document
    const tokenDoc = await ResetToken.findOne({ userId, token });
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }
    // Find user and update password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    // Hash the new password before saving (bcrypt is irreversible):contentReference[oaicite:9]{index=9}
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete used token
    await ResetToken.deleteOne({ _id: tokenDoc._id });

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


