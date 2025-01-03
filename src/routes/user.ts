import { Router, Request, Response } from 'express';
import UserProfile from '../models/UserProfile'; // Assuming the UserProfile model is in the models folder
import authenticate from './middleware/authenticate'; // Middleware to authenticate the request
import checkOwnership from './middleware/check-ownership';
import User from '../models/User';

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

export default router;
