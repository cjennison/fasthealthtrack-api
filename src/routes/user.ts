import { Router, Request, Response } from 'express';
import UserProfile from '../models/UserProfile'; // Assuming the UserProfile model is in the models folder
import authenticate from './middleware/authenticate'; // Middleware to authenticate the request
import checkOwnership from './middleware/check-ownership';
import User from '../models/User';
import {
  calculcateRecommendedCalorieGoal,
  Algorithm,
} from '../services/user-profile-service';
import UserPreference from '../models/UserPreferences';

const router = Router();

// Update UserProfile
router.put(
  '/:userId/profile',
  authenticate,
  checkOwnership(User, 'userId', '_id'),
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (req.body.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // Whitelisted fields for updating the user profile
    const allowedFields = ['age', 'weight', 'activityLevel', 'gender'];
    const userProfileUpdates: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        userProfileUpdates[field] = req.body[field];
      }
    });

    try {
      // Validate the provided user profile object
      if (Object.keys(userProfileUpdates).length === 0) {
        res
          .status(400)
          .json({ message: 'No valid fields provided for update' });
        return;
      }

      // Update the user profile in the database
      const updatedUserProfile = await UserProfile.findOneAndUpdate(
        { userId },
        userProfileUpdates,
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validation on the updated data
        }
      );

      if (!updatedUserProfile) {
        res.status(404).json({ message: 'User profile not found' });
        return;
      }

      res.status(200).json({
        message: 'User profile updated successfully',
        profile: updatedUserProfile,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        message: 'An error occurred while updating the profile',
        error,
      });
    }
  }
);

router.get(
  '/:userId/recommended-calorie-goal',
  authenticate,
  checkOwnership(User, 'userId', '_id'),
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { algorithm } = req.query;

    let algorithmType = algorithm as Algorithm;
    if (!algorithmType) {
      algorithmType = 'harris-benedict';
    }

    try {
      const calorieGoal = await calculcateRecommendedCalorieGoal(
        userId,
        algorithmType
      );

      res.status(200).json({ recommendedCalorieGoal: calorieGoal });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error calculating calorie goal', error });
    }
  }
);

router.put(
  '/:userId/preferences',
  authenticate,
  checkOwnership(User, 'userId', '_id'),
  async (req: Request, res: Response): Promise<void> => {
    const { weightHeightUnits } = req.body;
    const { userId } = req.params;

    if (!['imperial', 'metric'].includes(weightHeightUnits)) {
      res.status(400).json({
        message: `Invalid weightHeightUnits value. Allowed: 'imperial', 'metric'`,
      });
      return;
    }

    try {
      // Find or create the user preferences document
      let userPreferences = await UserPreference.findOne({ userId });

      if (userPreferences) {
        // Update existing preferences
        userPreferences.weightHeightUnits = weightHeightUnits;
      } else {
        // Create new preferences
        userPreferences = new UserPreference({ userId, weightHeightUnits });
      }

      await userPreferences.save();

      res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: userPreferences,
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: 'Error updating preferences', error });
    }
  }
);

export default router;
