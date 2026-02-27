import mongoose, { Document, Model, mongo } from "mongoose";

// Interface for the membership application
export interface IOfferView extends Document {
  _id?: string; // MongoDB generated
  user?: mongoose.Types.ObjectId;
  offer?: mongoose.Types.ObjectId;
  // Timestamps added automatically by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Model type
export type PartnerRequestModel = Model<IOfferView>;
