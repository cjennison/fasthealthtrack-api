import { Router } from 'express';
import { Request, Response } from 'express-serve-static-core';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import checkRole from './middleware/check-role';
import authenticate from './middleware/authenticate';
import verificationService from '../services/verification-service';
import Verification from '../models/Verification';
import VerificationStatus from '../models/VerificationStatus';
import {
  handleGetCurrentUser,
  handleSignup,
} from '../controllers/auth-controller';

const router = Router();

// Sign Up Endpoint
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const token = await handleSignup(req, res);
    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});

// Verify Endpoint
router.post(
  '/users/:id/verify',
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email, verificationCode, type } = req.body;
    try {
      const userById = await User.findById(id);
      const user = await User.findOne({ email });
      if (!user || !userById) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      if (user.id.toString() !== userById.id.toString()) {
        res.status(400).json({ message: 'Invalid user' });
        return;
      }

      const verification = await Verification.findOne({
        userId: user._id,
        type,
      });
      if (
        !verification ||
        !verificationService.verifyCode(
          verification.verificationCode,
          verificationCode
        )
      ) {
        res.status(400).json({ message: 'Invalid verification code' });
        return;
      }
      await VerificationStatus.findOneAndUpdate(
        { userId: user._id },
        { [`is${type.charAt(0).toUpperCase() + type.slice(1)}Verified`]: true },
        { upsert: true, new: true }
      );
      await verification.save();
      await Verification.deleteOne({ userId: user._id, type });
      res.status(200).json({
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`,
      });
    } catch (err) {
      res.status(500).json({ message: 'Error verifying', error: err });
    }
  }
);

// Resend Verification Code Endpoint
router.post(
  '/resend-verification',
  async (req: Request, res: Response): Promise<void> => {
    const { email, type } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      const userId = user._id;
      const newVerificationCode =
        verificationService.generateVerificationCode();
      await Verification.updateOne(
        { userId, type },
        { verificationCode: newVerificationCode },
        { upsert: true }
      );

      if (type === 'email') {
        if (!user.email) {
          res.status(400).json({
            message: 'User does not have an email to send the verification to',
          });
          return;
        }
        await verificationService.sendVerificationEmail(
          user.email,
          newVerificationCode
        );
      } else if (type === 'sms') {
        if (user.phoneNumber) {
          await verificationService.sendVerificationSMS(
            user.phoneNumber,
            newVerificationCode
          );
        } else {
          res.status(400).json({
            message: 'User does not have a phone number to send the SMS to',
          });
          return;
        }
      }

      res.status(200).json({
        message:
          'Verification code resent successfully. Please check your email or SMS.',
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Error resending verification code', error: err });
    }
  }
);

router.get(
  '/users/:id/verification-status',
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      const verificationStatus = await VerificationStatus.findOne({
        userId: user._id,
      }).lean();

      if (!verificationStatus) {
        // Create one
        const newVerificationStatus = new VerificationStatus({
          userId: user._id,
        });
        await newVerificationStatus.save();
        res.status(200).json(newVerificationStatus);
        return;
      }
      res.status(200).json(verificationStatus);
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Error fetching verification status', error: err });
    }
  }
);

// Login Endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token });
  } catch (err) {
    console.log('error', err);
    res.status(500).json({ message: 'Error logging in', error: err });
  }
});

router.get(
  '/currentUser',
  authenticate,
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ message: 'User ID not provided' });
      return;
    }

    try {
      const user = await handleGetCurrentUser(req, res);
      res.status(200).json(user);
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Error fetching anonymous user', error: err });
    }
  }
);

// Google OAuth Callback Endpoint
router.get('/google/callback', (req: Request, res: Response) => {
  // Google OAuth callback logic will be implemented here
  res.send('Google OAuth callback');
});

// Facebook OAuth Callback Endpoint
router.get('/facebook/callback', (req: Request, res: Response) => {
  // Facebook OAuth callback logic will be implemented here
  res.send('Facebook OAuth callback');
});

router.get('/check-username', async (req: Request, res: Response) => {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ message: 'Invalid or missing username' });
    return;
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(200).json({ available: false });
      return;
    }
    res.status(200).json({ available: true });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error checking username availability', error });
    return;
  }
});

router.delete(
  '/users/:userId',
  authenticate,
  checkRole('admin'),
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      await User.findByIdAndDelete(userId);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err });
    }
  }
);

export default router;
