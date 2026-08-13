import mongoose, { Model } from "mongoose";

export type IFavouriteExclusiveOffer = {
  _id?: string;
  user: mongoose.Types.ObjectId; 
  exclusiveOffer: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FavouriteExclusiveOfferModel = Model<IFavouriteExclusiveOffer>;
