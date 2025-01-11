import { Agent } from 'http';
import UserProfile from '../models/UserProfile';
import UserPreference from '../models/UserPreferences';

const DEFAULT_AGE = 24;
const DEFAULT_WEIGHT = 180.0;

// Type for the algorithm parameter
export type Algorithm = 'harris-benedict' | 'mifflin-st-jeor' | 'katch-mcardle';

export const hansBenedict = (
  age: number,
  weight: number,
  height: number,
  gender: string,
  activityLevel: string,
  units: string
): number => {
  let properWeight = weight;
  let properHeight = height;

  if (units === 'imperial') {
    properWeight = weight * 0.453592; // Convert lbs to kg
    properHeight = height * 2.54; // Convert inches to cm
  }

  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Assuming height=180cm for simplicity
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultiplier: Record<string, number> = {
    low: 1.2,
    moderate: 1.55,
    active: 1.9,
  };

  return Math.round(bmr * (activityMultiplier[activityLevel] || 1.2)); // Default to "low"
};

export const calculcateRecommendedCalorieGoal = async (
  userId: string,
  algorithm: Algorithm
) => {
  const userProfile = await UserProfile.findOne({ userId });
  if (!userProfile) {
    throw new Error('User profile not found');
  }

  const userPreferences = await UserPreference.findOne({ userId });
  if (!userPreferences) {
    throw new Error('User preference not found');
  }

  const { age, weight, height, gender, activityLevel } = userProfile;
  const units = userPreferences.weightHeightUnits;

  let calorieGoal: number = 2000;

  switch (algorithm) {
    case 'harris-benedict':
      calorieGoal = hansBenedict(
        age || DEFAULT_AGE,
        weight || DEFAULT_WEIGHT,
        height || 180,
        gender,
        activityLevel,
        units
      );
      break;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  return calorieGoal;
};
