import mongoose, { Schema, Document, Types } from 'mongoose';

interface IExerciseActivity extends Document {
  name: string;
  key: string;
  description: string;
  baseMetabolicRate: number; // The base metabolic rate of the exercise activity
}

const ExerciseActivitySchema = new Schema<IExerciseActivity>({
  name: {
    type: String,
    required: true,
    maxlength: 100, // Limit the length of the name to 100 characters
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
  ExerciseActivitySchema
);

export default ExerciseActivity;
