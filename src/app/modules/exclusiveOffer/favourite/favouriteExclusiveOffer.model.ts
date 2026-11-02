import { model, Schema } from 'mongoose';
import { IFavouriteExclusiveOffer, FavouriteExclusiveOfferModel } from './favouriteExclusiveOffer.interface';

const favouriteExclusiveOfferSchema = new Schema<IFavouriteExclusiveOffer, FavouriteExclusiveOfferModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exclusiveOffer: {
      type: Schema.Types.ObjectId,
      ref: 'ExclusiveOffer',
      required: true,
    },
  },
  { timestamps: true }
);

favouriteExclusiveOfferSchema.index({ user: 1, exclusiveOffer: 1 });

export const FavouriteExclusiveOffer = model<IFavouriteExclusiveOffer, FavouriteExclusiveOfferModel>(
  'FavouriteExclusiveOffer',
  favouriteExclusiveOfferSchema
);
