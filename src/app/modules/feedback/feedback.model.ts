import { model, Schema, Model } from "mongoose";
import { ITeamContact, TeamContactModel } from "./feedback.interface";

const teamContactSchema = new Schema<ITeamContact, TeamContactModel>(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5, 
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const Feedback = model<ITeamContact, TeamContactModel>(
  "Feedback",
  teamContactSchema
);