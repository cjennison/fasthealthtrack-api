import mongoose, { Schema, Document, Types } from 'mongoose';

interface IFoodItem extends Document {
  name: string; // The name of the food item
  caloriesPerUnit: number; // Calorie count per unit or a standard serving
  units: string; // Unit of measurement (e.g., "serving", "piece", "gram")
  description?: string; // Optional description of the food item
}

const FoodItemSchema = new Schema<IFoodItem>({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure food items are unique by name
  },
  caloriesPerUnit: {
    type: Number,
    required: true,
  },
  units: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);

export default FoodItem;
