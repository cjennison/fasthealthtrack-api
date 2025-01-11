import { Router } from 'express';
import { Request, Response } from 'express-serve-static-core';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import verificationService from '../services/verification-service';
import Verification from '../models/Verification';
import VerificationStatus from '../models/VerificationStatus';
import UserProfile from '../models/UserProfile';
import UserPreference from '../models/UserPreferences';

// Helpers
export const findOrCreateUserPreferences = async (userId: string) => {
  let userPreference = await UserPreference.findOne({ userId });
  if (!userPreference) {
    userPreference = new UserPreference({
      userId,
      weightHeightUnits: 'imperial',
    });
    await userPreference.save();
  }
  return userPreference;
};

// Controller methods
export const handleSignup = async (req: any, res: any): Promise<any> => {
  const { email, password, username, phoneNumber } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    res
      .status(400)
      .json({ message: 'User with this email or username already exists' });
    return;
  }
  const user = new User({ email, password, username, phoneNumber });
  await user.save();

  // Create default UserProfile
  const userProfile = new UserProfile({ userId: user._id });
  await userProfile.save();

  // Create default UserPreference
  const userPreference = new UserPreference({ userId: user._id });
  await userPreference.save();

  const verificationCode = verificationService.generateVerificationCode();
  if (email) {
    const emailVerification = new Verification({
      userId: user._id,
      verificationCode,
      type: 'email',
    });
    await emailVerification.save();

    // Create verification status
    const verificationStatus = new VerificationStatus({
      userId: user._id,
    });
    await verificationStatus.save();
    verificationService.sendVerificationEmail(email, verificationCode);
  }
  if (phoneNumber) {
    const smsVerification = new Verification({
      userId: user._id,
      verificationCode,
      type: 'sms',
    });
    await smsVerification.save();

    // Create verification status
    const verificationStatus = new VerificationStatus({
      userId: user._id,
    });
    await verificationStatus.save();
    await verificationService.sendVerificationSMS(
      phoneNumber,
      verificationCode
    );
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
  return token;
};

export const handleGetCurrentUser = async (
  req: any,
  res: any
): Promise<any> => {
  const { userId } = req.body;
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Get UserProfile
  const userProfile = await UserProfile.findOne({ userId }).lean();

  // Get UserPreference
  let userPreferences: any = await UserPreference.findOne({ userId }).lean();
  if (!userPreferences) {
    userPreferences = await findOrCreateUserPreferences(userId);
  }

  // Merge UserProfile into user object
  const mergedUser = {
    ...user,
    userProfile: userProfile,
    userPreferences: userPreferences,
  };

  return mergedUser;
};
