import { Schema, model, Document, Types } from 'mongoose';

interface IUserProfile extends Document {
  userId: Types.ObjectId;
  age?: number;
  weight?: number;
  activityLevel: 'low' | 'moderate' | 'active';
  calorieGoal: number;
  height?: number; //cm
  gender:
    | 'male'
    | 'female'
    | 'non-binary'
    | 'genderqueer'
    | 'genderfluid'
    | 'other'
    | 'prefer not to answer';
}

const userProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    default: 24,
  },
  weight: {
    type: Number,
    default: 180.0, //kgs
  },
  height: {
    type: Number,
    default: 180, // cms
  },
  activityLevel: {
    type: String,
    enum: ['low', 'moderate', 'active'],
    default: 'moderate',
  },
  calorieGoal: {
    type: Number,
    default: 2000,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer not to answer'],
    default: 'prefer not to answer',
  },
});

const UserProfile = model<IUserProfile>('UserProfile', userProfileSchema);
export default UserProfile;
