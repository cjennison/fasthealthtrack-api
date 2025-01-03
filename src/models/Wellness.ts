import mongoose, { Schema, Document, Types } from 'mongoose';

interface IFoodEntry extends Document {
  name: string;
  quantity: string;
  calories: number;
}

const FoodEntrySchema = new Schema<IFoodEntry>({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  calories: { type: Number, required: true },
});

const FoodEntry = mongoose.model<IFoodEntry>('FoodEntry', FoodEntrySchema);

interface IExerciseEntry extends Document {
  name: string;
  type: string;
  intensity: string;
  caloriesBurned: number;
}

const ExerciseEntrySchema = new Schema<IExerciseEntry>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  intensity: { type: String, required: true },
  caloriesBurned: { type: Number, required: true },
});

const ExerciseEntry = mongoose.model<IExerciseEntry>(
  'ExerciseEntry',
  ExerciseEntrySchema
);

interface IWellnessData extends Document {
  userId: Types.ObjectId;
  date: String;
  foodEntries: Types.Array<IFoodEntry>;
  exerciseEntries: Types.Array<IExerciseEntry>;
  glassesOfWater: number;
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
    unique: true,
  }, // YYYY-MM-DD format
  foodEntries: [{ type: FoodEntrySchema }],
  exerciseEntries: [{ type: ExerciseEntrySchema }],
  glassesOfWater: { type: Number, default: 0 },
});

const WellnessData = mongoose.model<IWellnessData>(
  'WellnessData',
  WellnessDataSchema
);

export { WellnessData, FoodEntry, ExerciseEntry };
