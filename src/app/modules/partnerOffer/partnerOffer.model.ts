import { model, Schema } from 'mongoose';
import {
  IPartnerOffer,
  PartnerOfferModel,
} from './partnerOffer.interface';

const partnerOfferSchema = new Schema<IPartnerOffer, PartnerOfferModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String
    },
    location: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
    },
    colorCard: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const PartnerOffer = model<IPartnerOffer, PartnerOfferModel>(
  'PartnerOffer',
  partnerOfferSchema
);

