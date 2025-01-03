import { Schema, model, Document, Types } from 'mongoose';

interface IUserProfile extends Document {
  userId: Types.ObjectId;
  age?: number;
  weight?: number;
  activityLevel: 'low' | 'moderate' | 'active';
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
    default: 180.0,
  },
  activityLevel: {
    type: String,
    enum: ['low', 'moderate', 'active'],
    default: 'moderate',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer not to answer'],
    default: 'prefer not to answer',
  },
});

const UserProfile = model<IUserProfile>('UserProfile', userProfileSchema);
export default UserProfile;
