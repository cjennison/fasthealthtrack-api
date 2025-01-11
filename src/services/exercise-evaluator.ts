import {
  createCompletion,
  contentPassesModeration,
} from './openai-connection-service';
import Prompts from '../prompts';
import ExerciseActivity from '../models/ExerciseActivity';
import { normalizeString } from '../utils/string-normalizer';
import ContentModerationError from '../errors/ContentModerationError';

interface ExerciseActivityElements {
  name: string;
  baseMetabolicRate: number;
  description: string;
}

export const getExerciseActivityInformationFromAI = async (
  exerciseName: string,
  type: 'cardio' | 'strength' | 'other'
): Promise<ExerciseActivityElements> => {
  const contentPrompt = Prompts.exerciseEffortEstimatorPrompt(
    exerciseName,
    type
  );

  // Moderate content
  let isContentModerated: Boolean =
    await contentPassesModeration(contentPrompt);

  if (!isContentModerated) {
    console.log('Content flagged by moderation');
    throw new ContentModerationError('Content flagged by moderation');
  }

  const response = await createCompletion(contentPrompt);
  if (!response) {
    console.log('No response from OpenAI');
    throw new Error('No response from OpenAI');
  }

  try {
    if (typeof response?.message.content === 'string') {
      const data = JSON.parse(response.message.content);

      let name = '';
      let baseMetabolicRate = 0;
      let description = '';

      if (data.name && typeof data.name === 'string') {
        name = data.name;
      } else {
        throw new Error('No name found in OpenAI response');
      }

      if (
        data.baseMetabolicRate &&
        typeof data.baseMetabolicRate === 'number'
      ) {
        baseMetabolicRate = data.baseMetabolicRate;
      } else {
        throw new Error('No baseMetabolicRate found in OpenAI response');
      }

      if (data.description && typeof data.description === 'string') {
        description = data.description;
      } else {
        console.log('No description found in OpenAI response');
        throw new Error('No description found in OpenAI response');
      }

      return { name, baseMetabolicRate, description };
    }
  } catch (error) {
    console.log('Error parsing OpenAI response', error);
    throw new Error('Error parsing OpenAI response');
  }
  throw new Error('Invalid response from OpenAI');
};

export const findOrCreateExerciseActivity = async (
  exerciseName: string,
  type: 'cardio' | 'strength' | 'other'
): Promise<any> => {
  const name = normalizeString(exerciseName);
  const existingExercise = await ExerciseActivity.findOne({ key: name });
  if (existingExercise) {
    return existingExercise;
  }

  try {
    const exercise = await getExerciseActivityInformationFromAI(name, type);
    const newExercise = new ExerciseActivity({
      name: exercise.name,
      key: normalizeString(exercise.name),
      baseMetabolicRate: exercise.baseMetabolicRate,
      description: exercise.description,
    });
    await newExercise.save();

    return newExercise;
  } catch (error) {
    throw error;
  }
};

const intensityMultipliers: Record<string, number> = {
  easy: 0.75,
  moderate: 1.0,
  hard: 1.25,
};

// Explanation of this calculation:
// MET Value: The Metabolic Equivalent of Task (MET) value of the exercise activity.
// Weight (kg): The weight of the person in kilograms.
// Duration (hours): The duration of the exercise activity in hours.
// The MET value is multiplied by the weight of the person in kilograms and the duration of the exercise activity in hours to calculate the calories burned.
export const calculateCaloriesBurned = (
  baseMetabolicRate: number,
  duration: number, // In minutes
  intensity: 'easy' | 'moderate' | 'hard',
  weight: number,
  weightUnits: 'imperial' | 'metric'
): number => {
  const met = baseMetabolicRate * intensityMultipliers[intensity];
  const weightInKg = weightUnits === 'imperial' ? weight : weight * 0.453592; // Convert lbs to kg
  const caloriesBurned = met * weightInKg * (duration / 60); // Convert duration to hours
  return Math.floor(caloriesBurned);
};
