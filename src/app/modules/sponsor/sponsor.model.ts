import { model, Schema } from 'mongoose';
import {
  ISponsor,
  SponsorModel,
} from './sponsor.interface';

const sponsorSchema = new Schema<ISponsor, SponsorModel>(
  {
    logo: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    publishing: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Sponsor = model<ISponsor, SponsorModel>(
  'Sponsor',
  sponsorSchema
);

