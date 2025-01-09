import { response, Router } from 'express';
import { Request, Response } from 'express-serve-static-core';

import UserProfile from '../models/UserProfile';
import { WellnessData, FoodEntry, ExerciseEntry } from '../models/Wellness';

import {
  calculcateCaloriesBurned,
  findOrCreateExerciseActivity,
} from '../services/exercise-evaluator';
import {
  calculateCalories,
  findOrCreateFood,
} from '../services/food-evaluator';

export const createFoodEntry = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { wellnessDataId } = req.params;
  const { name, quantity, unit, calories } = req.body;

  let foodEntry;

  if (calories && typeof calories == 'number') {
    // If calories are provided by the user, then no evaluation is needed
    if (calories <= 0) {
      res.status(400).json({ message: 'Calories must be greater than 0' });
      return;
    }
    const personalFoodEntry = new FoodEntry({
      wellnessDataId,
      name,
      quantity,
      calories: calories,
    });

    await personalFoodEntry.save();
    foodEntry = personalFoodEntry;
  } else {
    const foodItem = await findOrCreateFood(name);
    if (!foodItem) {
      res.status(400).json({ message: 'Could not find or create food item' });
      return;
    }

    const evaluatedCalories = calculateCalories(
      foodItem.caloriesPerUnit,
      quantity
    );
    const caloriesConsumed = calories || evaluatedCalories;

    const generatedFoodEntry = new FoodEntry({
      foodItemId: foodItem._id,
      wellnessDataId,
      name: foodItem.name,
      quantity,
      calories: caloriesConsumed,
    });

    await generatedFoodEntry.save();
    foodEntry = generatedFoodEntry;
  }

  await WellnessData.findByIdAndUpdate(wellnessDataId, {
    $push: { foodEntries: foodEntry._id },
    hasActivity: true,
  });

  return foodEntry;
};

export const createExerciseEntry = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { wellnessDataId } = req.params;
  const { name, type, intensity, duration, caloriesBurned } = req.body;

  let exerciseEntry;

  if (caloriesBurned && typeof caloriesBurned == 'number') {
    const personalExerciseEntry = new ExerciseEntry({
      wellnessDataId,
      name,
      type,
      intensity,
      duration,
      caloriesBurned,
    });
    await personalExerciseEntry.save();

    exerciseEntry = personalExerciseEntry;
  } else {
    // Generate an exercise item from AI
    const exerciseActivity = await findOrCreateExerciseActivity(name, type);
    if (!exerciseActivity) {
      res
        .status(400)
        .json({ message: 'Could not find or create exercise activity' });
      return;
    }

    // Get user profile
    const userProfile = await UserProfile.findOne({
      userId: req.body.userId,
    });
    if (!userProfile || !userProfile.weight) {
      res.status(400).json({ message: 'User profile not found' });
      return;
    }

    const calculcatedCaloriesBurned = calculcateCaloriesBurned(
      exerciseActivity.baseMetabolicRate,
      duration,
      intensity,
      userProfile.weight,
      'lbs'
    );

    const generatedExerciseEntry = new ExerciseEntry({
      exerciseActivityId: exerciseActivity._id,
      wellnessDataId,
      name: exerciseActivity.name,
      type,
      intensity,
      duration,
      caloriesBurned: calculcatedCaloriesBurned,
    });

    generatedExerciseEntry.save();
    exerciseEntry = generatedExerciseEntry;
  }

  await WellnessData.findByIdAndUpdate(wellnessDataId, {
    $push: { exerciseEntries: exerciseEntry._id },
    hasActivity: true,
  });

  return exerciseEntry;
};
