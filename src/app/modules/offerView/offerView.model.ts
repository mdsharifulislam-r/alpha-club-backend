import mongoose, { Model, Schema } from "mongoose";
import { IOfferView } from "./offerView.interface";

const OfferViewSchema = new Schema<IOfferView>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
  },
  { timestamps: true }
);

export const OfferView: Model<IOfferView> = mongoose.model<IOfferView>("OfferView",OfferViewSchema);