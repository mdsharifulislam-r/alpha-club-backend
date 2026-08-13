import { model, Schema } from 'mongoose';
import {
  IClub,
  ClubModel,
} from './club.interface';

const clubSchema = new Schema<IClub, ClubModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
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
    limitOfMember: {
      type: Number,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Club = model<IClub, ClubModel>(
  'Club',
  clubSchema
);

