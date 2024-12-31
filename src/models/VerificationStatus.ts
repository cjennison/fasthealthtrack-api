import { Schema, model, Document, Types } from 'mongoose';

// VerificationStatus Model
interface IVerificationStatus extends Document {
  userId: Types.ObjectId;
  isEmailVerified: boolean;
  isSmsVerified: boolean;
}

const verificationStatusSchema = new Schema<IVerificationStatus>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isSmsVerified: {
    type: Boolean,
    default: false,
  },
});

const VerificationStatus = model<IVerificationStatus>(
  'VerificationStatus',
  verificationStatusSchema
);
export default VerificationStatus;
