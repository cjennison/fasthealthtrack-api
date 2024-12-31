// Verification Model
import { Schema, model, Document, Types } from 'mongoose';

interface IVerification extends Document {
  userId: Types.ObjectId;
  verificationCode: string;
  type: 'email' | 'sms';
  createdAt: {
    type: Date;
    default: Date;
    expires: '10m'; // Automatically delete after 24 hours
  };
}

const verificationSchema = new Schema<IVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m', // Automatically delete after 24 hours
  },
});

const Verification = model<IVerification>('Verification', verificationSchema);
export default Verification;
