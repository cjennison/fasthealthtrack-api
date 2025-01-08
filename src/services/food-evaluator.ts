import { createCompletion } from '../services/openai-connection-service';
import FoodItem from '../models/FoodItem';
import Prompts from '../prompts';
import { normalizeString } from '../utils/string-normalizer';

interface FoodItemElements {
  name: string;
  caloriesPerUnit: number;
  units: string;
  description: string;
}

export const getFoodItemInformationFromAI = async (
  foodName: string
): Promise<FoodItemElements> => {
  const response = await createCompletion(
    Prompts.calorieEstimationPrompt(foodName)
  );
  if (!response) {
    console.log('No response from OpenAI');
    throw new Error('No response from OpenAI');
  }

  try {
    if (typeof response?.message.content === 'string') {
      const data = JSON.parse(response.message.content);

      let name = '';
      let caloriesPerUnit = 0;
      let units = '';
      let description = '';

      if (data.name && typeof data.name === 'string') {
        name = data.name;
      } else {
        throw new Error('No name found in OpenAI response');
      }

      if (data.caloriesPerUnit && typeof data.caloriesPerUnit === 'number') {
        caloriesPerUnit = data.caloriesPerUnit;
      } else {
        throw new Error('No caloriesPerUnit found in OpenAI response');
      }

      if (data.units && typeof data.units === 'string') {
        units = data.units;
      } else {
        throw new Error('No units found in OpenAI response');
      }

      if (data.description && typeof data.description === 'string') {
        description = data.description;
      } else {
        console.log('No description found in OpenAI response');
        throw new Error('No description found in OpenAI response');
      }

      return { name, caloriesPerUnit, units, description };
    }
  } catch (error) {
    throw new Error('Error parsing JSON content: ' + error);
  }
  throw new Error('Invalid response format from OpenAI');
};

export const findOrCreateFood = async (name: string): Promise<any> => {
  const key = normalizeString(name);
  let food = await FoodItem.findOne({ key });
  if (!food) {
    try {
      const foodElements = await getFoodItemInformationFromAI(name);
      food = new FoodItem({
        name: foodElements.name,
        key: normalizeString(foodElements.name),
        caloriesPerUnit: Math.floor(foodElements.caloriesPerUnit), // Ensure calories are whole numbers
        units: foodElements.units,
        description: foodElements.description,
      });
      await food.save();
    } catch (error) {
      console.log('Error creating food item: ' + error);
      throw new Error('Error creating food item: ' + error);
    }
  }
  return food;
};

export const getFoodItemNamesFromAI = async (
  foodName: string
): Promise<string[]> => {
  try {
    const response = await createCompletion(
      Prompts.foodNormalizerPrompt(foodName)
    );
    if (!response) {
      console.log('No response from OpenAI');
      throw new Error('No response from OpenAI');
    }
    if (typeof response?.message.content === 'string') {
      const data = JSON.parse(response.message.content);
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          if (item.name && typeof item.name === 'string') {
            return item.name;
          }
          throw new Error('No name found in OpenAI response');
        });
      }
    }
  } catch (error) {
    throw new Error('Error parsing JSON content: ' + error);
  }
  throw new Error('Invalid response format from OpenAI');
};

export const calculateCalories = (
  caloriesPerUnit: number,
  quantity: string
): number => {
  const multipliers: Record<string, number> = {
    some: 0.5,
    half: 0.5,
    full: 1.0,
    extra: 1.5,
  };
  return Math.floor(caloriesPerUnit * (multipliers[quantity] || 1.0));
};
