import mongoose, { Schema, Types } from "mongoose";
import { INotification, INotificationModel } from "./notification.interface";

const notificationSchema = new Schema<INotification, INotificationModel>(
    {
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
        },
        refId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        deleteReferenceId: {
            type: Schema.Types.ObjectId,
        },
        seen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ receiver: 1, seen: 1 });

export const Notification = mongoose.model<INotification, INotificationModel>("Notification",
    notificationSchema
);