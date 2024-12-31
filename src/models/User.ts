import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

import UserProfile from './UserProfile';

interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  googleId?: string;
  facebookId?: string;
  role: 'standard' | 'premium' | 'admin';
  createdAt: {
    type: Date;
    default: Date;
  };
  phoneNumber?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    sparse: true, // Allows null values to be unique
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  googleId: String,
  facebookId: String,
  role: {
    type: String,
    enum: ['standard', 'premium', 'admin'],
    default: 'standard',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be unique
    validate: {
      validator: function (v: string) {
        return validator.isMobilePhone(v, 'any', { strictMode: false });
      },
      message: 'Invalid phone number',
    },
  },
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('User', userSchema);
export default User;
