import mongoose, { Model, Schema } from "mongoose";
import { IOfferView } from "./offerView.interface";

const OfferViewSchema = new Schema<IOfferView>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
  },
  { timestamps: true }
);

OfferViewSchema.index({ offer: 1 });
OfferViewSchema.index({ user: 1, offer: 1 });

export const OfferView: Model<IOfferView> = mongoose.model<IOfferView>("OfferView",OfferViewSchema);