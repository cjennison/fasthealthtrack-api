import { response, Router } from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';

import checkRole from './middleware/check-role';
import authenticate from './middleware/authenticate';
import { WellnessData, FoodEntry, ExerciseEntry } from '../models/Wellness';
import checkOwnership from './middleware/check-ownership';
import User from '../models/User';
import checkModelOwnership from './utils/check-model-ownership';

import {
  createExerciseEntry,
  createFoodEntry,
} from '../controllers/entry-controller';

const router = Router();

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Get Wellness Data for a range of dates
router.get(
  '/users/:userId/daterange',
  authenticate,
  checkOwnership(User, 'userId', '_id'),
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };
    const query: Record<string, any> = { userId: req.params.userId };

    if (!startDate && !endDate) {
      res.status(400).json({ message: 'Please provide a start or end date' });
      return;
    }

    if (startDate) {
      query.date = { $gte: startDate };
    }
    if (endDate) {
      query.date = { ...query.date, $lte: endDate };
    }

    try {
      const wellnessData = await WellnessData.find(query)
        .populate({
          path: 'foodEntries',
          populate: {
            path: 'foodItemId',
            model: 'FoodItem',
          },
        })
        .populate({
          path: 'exerciseEntries',
          populate: {
            path: 'exerciseActivityId',
            model: 'ExerciseActivity',
          },
        });
      res.status(200).json(wellnessData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
    }
  }
);

router.get(
  '/users/:userId/streak',
  authenticate,
  checkOwnership(User, 'userId', '_id'),
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const todayFormatted = formatDate(new Date());

      // Fetch all wellness data for the user sorted by date descending
      const wellnessData = await WellnessData.find({
        userId,
        date: { $lte: todayFormatted },
        hasActivity: true,
      })
        .sort({ date: -1 })
        .select('date hasActivity');

      if (wellnessData.length === 0) {
        res.status(200).json({ streak: 0 });
        return;
      }

      let streak = 0;
      let previousDate = new Date(todayFormatted); // Start with today's date

      for (let i = 0; i < wellnessData.length; i++) {
        const currentDate = new Date(wellnessData[i].date.toString());
        const diffDays =
          (previousDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);

        if (diffDays === 0 || diffDays === 1) {
          // Count streak only for today or the next consecutive day
          streak++;
          previousDate = currentDate;
        } else if (diffDays > 1) {
          break; // Streak broken
        }
      }

      res.status(200).json({
        streak,
        dateProcessedFrom: todayFormatted,
        streakFromDate: formatDate(previousDate),
      });
    } catch (error) {
      console.error('Error calculating streak:', error);
      res.status(500).json({ message: 'Error calculating streak', error });
    }
  }
);

// Get Wellness Data for a specific date for a user
router.get(
  '/users/:userId/:date',
  authenticate,
  checkOwnership(User, 'userId', '_id'),
  async (req: Request, res: Response) => {
    const { date, userId } = req.params;

    try {
      const wellnessData = await WellnessData.findOne({
        date: formatDate(date),
        userId: userId,
      })
        .populate({
          path: 'foodEntries',
          populate: {
            path: 'foodItemId',
            model: 'FoodItem',
          },
        })
        .populate({
          path: 'exerciseEntries',
          populate: {
            path: 'exerciseActivityId',
            model: 'ExerciseActivity',
          },
        });

      if (!wellnessData) {
        res.status(404).json({ message: 'No data found for this date' });
        return;
      }
      res.status(200).json(wellnessData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
    }
  }
);

// Add a new Wellness Data entry for a specific date
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { date, glassesOfWater } = req.body;

  try {
    const existingData = await WellnessData.findOne({
      date: date,
      userId: req.body.userId,
    });

    if (existingData) {
      res.status(400).json({ message: 'Data already exists for this date' });
    } else {
      const newData = new WellnessData({
        userId: req.body.userId,
        date: formatDate(date),
        glassesOfWater: glassesOfWater || 0, // Default to 0 if not provided
      });
      await newData.save();
      res.status(200).json(newData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving data', error });
  }
});

// Update Wellness Data by Id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { glassesOfWater } = req.body;

  try {
    const wellnessData = await WellnessData.findById(id);
    if (!checkModelOwnership(wellnessData, 'userId', req.body.userId)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    if (!wellnessData) {
      res.status(404).json({ message: 'No data found for this date' });
      return;
    }

    wellnessData.glassesOfWater = glassesOfWater;

    //  trigger hasActivity flag if glassesOfWater is updated to be non-zero
    wellnessData.hasActivity = wellnessData.hasActivity || glassesOfWater > 0;
    await wellnessData.save();

    res.status(200).json(wellnessData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating data', error });
  }
});

// Add a food entry to a wellness data item
router.post(
  '/:wellnessDataId/food',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { wellnessDataId } = req.params;
    const { name, quantity, calories } = req.body;

    try {
      const wellnessData = await WellnessData.findById(wellnessDataId);
      if (!checkModelOwnership(wellnessData, 'userId', req.body.userId)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      // Check name, quantity
      if (!name || !quantity) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // Confirm name is < 100 characters
      if (name.length > 100) {
        res
          .status(400)
          .json({ message: 'Name must be less than 100 characters' });
        return;
      }

      const foodEntry = await createFoodEntry(req, res);
      const populatedFoodEntry = await FoodEntry.findById(
        foodEntry._id
      ).populate('foodItemId');

      res.status(200).json(populatedFoodEntry);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:wellnessDataId/exercise',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { wellnessDataId } = req.params;
    const { name, type, intensity, duration, caloriesBurned } = req.body;

    try {
      const wellnessData = await WellnessData.findById(wellnessDataId);
      if (!checkModelOwnership(wellnessData, 'userId', req.body.userId)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      // Check name, type, intensity, duration
      if (!name || !type || !intensity || !duration) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // Confirm name is < 100 characters
      if (name.length > 100) {
        res
          .status(400)
          .json({ message: 'Name must be less than 100 characters' });
        return;
      }

      const exerciseEntry = await createExerciseEntry(req, res);
      const populatedExerciseEntry = await ExerciseEntry.findById(
        exerciseEntry._id
      ).populate('exerciseActivityId');

      res.status(200).json(populatedExerciseEntry);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:wellnessDataId/food/:foodEntryId',
  authenticate,
  async (req: Request, res: Response) => {
    const { wellnessDataId, foodEntryId } = req.params;

    try {
      const wellnessData = await WellnessData.findById(wellnessDataId);
      if (!checkModelOwnership(wellnessData, 'userId', req.body.userId)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      await FoodEntry.findByIdAndDelete(foodEntryId);

      await WellnessData.findByIdAndUpdate(wellnessDataId, {
        $pull: { foodEntries: foodEntryId },
      });

      res.status(200).json({ message: 'Food entry removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing food entry', error });
    }
  }
);

router.delete(
  '/:wellnessDataId/exercise/:exerciseEntryId',
  authenticate,
  async (req: Request, res: Response) => {
    const { wellnessDataId, exerciseEntryId } = req.params;

    try {
      const wellnessData = await WellnessData.findById(wellnessDataId);
      if (!checkModelOwnership(wellnessData, 'userId', req.body.userId)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      await ExerciseEntry.findByIdAndDelete(exerciseEntryId);
      await WellnessData.findByIdAndUpdate(wellnessDataId, {
        $pull: { exerciseEntries: exerciseEntryId },
      });

      res.status(200).json({ message: 'Exercise entry removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing food entry', error });
    }
  }
);

export default router;
