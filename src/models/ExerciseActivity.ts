import mongoose, { Schema, Document, Types } from 'mongoose';

interface IExerciseActivity extends Document {
  name: string;
  key: string;
  description: string;
  baseMetabolicRate: number; // The base metabolic rate of the exercise activity
}

const FoodItemSchema = new Schema<IExerciseActivity>({
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true, // Ensure exercise activities are unique by key
  },
  baseMetabolicRate: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
});

const ExerciseActivity = mongoose.model<IExerciseActivity>(
  'ExerciseActivity',
  FoodItemSchema
);

export default ExerciseActivity;
