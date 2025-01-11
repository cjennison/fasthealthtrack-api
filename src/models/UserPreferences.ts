import { Schema, model, Document, Types } from 'mongoose';

interface IUserPreference extends Document {
  userId: Types.ObjectId;
  weightHeightUnits: 'imperial' | 'metric';
}

const userPreferenceSchema = new Schema<IUserPreference>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  weightHeightUnits: {
    type: String,
    enum: ['imperial', 'metric'],
    default: 'imperial',
  },
});

const UserPreference = model<IUserPreference>(
  'UserPreference',
  userPreferenceSchema
);
export default UserPreference;
