import { model, Schema, Types } from "mongoose";
import { MemberRedemptionModel, ImemberRedemption } from "./member-redemption.interface";

// Schema definition
const memberRedemptionSchema = new Schema<ImemberRedemption, MemberRedemptionModel>(
  {
    creator: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

memberRedemptionSchema.index({ creator: 1, date: 1 });
memberRedemptionSchema.index({ user: 1, date: 1 });
memberRedemptionSchema.index({ date: 1 });

// Model export
export const MemberRedemption = model<ImemberRedemption, MemberRedemptionModel>(
  "MemberRedemption",
  memberRedemptionSchema
);