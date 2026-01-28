import { Schema, model } from 'mongoose';

export const USER_PROFILE_UPDATE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type IUserProfileUpdateRequest = {
  user: Schema.Types.ObjectId;
  name?: string;
  profileImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
};

const userProfileUpdateRequestSchema = new Schema<IUserProfileUpdateRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(USER_PROFILE_UPDATE_STATUS),
      default: USER_PROFILE_UPDATE_STATUS.PENDING,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const UserProfileUpdateRequest = model(
  'UserProfileUpdateRequest',
  userProfileUpdateRequestSchema
);
