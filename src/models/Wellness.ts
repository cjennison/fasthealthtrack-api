import mongoose, { Schema, Document, Types } from 'mongoose';

interface IFoodEntry extends Document {
  wellnessDataId: Types.ObjectId;
  name: string;
  foodItemId: Types.ObjectId;
  quantity: 'some' | 'half' | 'full' | 'extra';
  calories: number;
}

const FoodEntrySchema = new Schema<IFoodEntry>({
  wellnessDataId: {
    type: Schema.Types.ObjectId,
    ref: 'WellnessData',
    required: true,
  },
  foodItemId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: false,
  },
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  calories: { type: Number, required: true },
});

FoodEntrySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    if (ret.foodItemId) {
      ret.foodItem = ret.foodItemId; // Rename foodItemId to foodItem
      delete ret.foodItemId; // Remove foodItemId from the output
    }
    return ret;
  },
});

const FoodEntry = mongoose.model<IFoodEntry>('FoodEntry', FoodEntrySchema);

interface IExerciseEntry extends Document {
  wellnessDataId: Types.ObjectId;
  exerciseActivityId: Types.ObjectId;
  name: string;
  type: 'cardio' | 'strength' | 'other';
  intensity: 'easy' | 'moderate' | 'hard';
  duration: number;
  caloriesBurned: number;
}

const ExerciseEntrySchema = new Schema<IExerciseEntry>({
  wellnessDataId: {
    type: Schema.Types.ObjectId,
    ref: 'WellnessData',
    required: true,
  },
  exerciseActivityId: {
    type: Schema.Types.ObjectId,
    ref: 'ExerciseActivity',
    required: false,
  },
  name: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  intensity: { type: String, required: true },
  caloriesBurned: { type: Number, required: true },
});

ExerciseEntrySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    if (ret.exerciseActivityId) {
      ret.exerciseActivity = ret.exerciseActivityId; // Rename foodItemId to foodItem
      delete ret.exerciseActivityId; // Remove foodItemId from the output
    }
    return ret;
  },
});

const ExerciseEntry = mongoose.model<IExerciseEntry>(
  'ExerciseEntry',
  ExerciseEntrySchema
);

interface IWellnessData extends Document {
  userId: Types.ObjectId;
  date: String;
  foodEntries: Types.ObjectId[];
  exerciseEntries: Types.ObjectId[];
  glassesOfWater: number;
  hasActivity: boolean;
}

const WellnessDataSchema = new Schema<IWellnessData>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  }, // YYYY-MM-DD format
  foodEntries: [{ type: Schema.Types.ObjectId, ref: 'FoodEntry' }],
  exerciseEntries: [{ type: Schema.Types.ObjectId, ref: 'ExerciseEntry' }],
  glassesOfWater: { type: Number, default: 0 },
  hasActivity: { type: Boolean, default: false },
});

//  Ensure that there is only one wellness data item per user per day
WellnessDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const WellnessData = mongoose.model<IWellnessData>(
  'WellnessData',
  WellnessDataSchema
);

export { WellnessData, FoodEntry, ExerciseEntry };
