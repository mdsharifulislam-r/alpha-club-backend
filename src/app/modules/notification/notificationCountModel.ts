import mongoose, { Schema, Types, Model } from "mongoose";

export interface INotificationCount {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type INotificationCountModel = Model<INotificationCount, Record<string, unknown>>;

const notificationCountSchema = new Schema<INotificationCount, INotificationCountModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const NotificationCount = mongoose.model<INotificationCount, INotificationCountModel>("NotificationCount",notificationCountSchema);