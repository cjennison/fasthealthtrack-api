import { response, Router } from 'express';
import { Request, Response } from 'express-serve-static-core';

import checkRole from './middleware/check-role';
import authenticate from './middleware/authenticate';
import { WellnessData, FoodEntry, ExerciseEntry } from '../models/Wellness';
import checkOwnership from './middleware/check-ownership';
import User from '../models/User';
import checkModelOwnership from './utils/check-model-ownership';

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
      const wellnessData = await WellnessData.find(query).populate(
        'foodEntries exerciseEntries'
      );
      res.status(200).json(wellnessData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
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
      }).populate('foodEntries exerciseEntries');
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
  async (req: Request, res: Response) => {
    const { wellnessDataId } = req.params;
    const { name, quantity, calories } = req.body;

    try {
      const foodEntry = new FoodEntry({
        wellnessDataId,
        name,
        quantity,
        calories,
      });
      await foodEntry.save();

      await WellnessData.findByIdAndUpdate(wellnessDataId, {
        $push: { foodEntries: foodEntry._id },
      });

      res.status(200).json(foodEntry);
    } catch (error) {
      res.status(500).json({ message: 'Error adding food entry', error });
    }
  }
);

router.post(
  '/:wellnessDataId/exercise',
  authenticate,
  async (req: Request, res: Response) => {
    const { wellnessDataId } = req.params;
    const { name, type, intensity, caloriesBurned } = req.body;

    try {
      const exerciseEntry = new ExerciseEntry({
        wellnessDataId,
        name,
        type,
        intensity,
        caloriesBurned,
      });
      await exerciseEntry.save();

      await WellnessData.findByIdAndUpdate(wellnessDataId, {
        $push: { exerciseEntries: exerciseEntry._id },
      });

      res.status(200).json(exerciseEntry);
    } catch (error) {
      res.status(500).json({ message: 'Error adding exercise entry', error });
    }
  }
);

router.delete(
  '/:wellnessDataId/food/:foodEntryId',
  authenticate,
  async (req: Request, res: Response) => {
    const { wellnessDataId, foodEntryId } = req.params;

    try {
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
