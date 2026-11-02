import { model, Schema } from 'mongoose';
import {
  IExclusiveOffer,
  ExclusiveOfferModel,
} from './exclusiveOffer.interface';

const exclusiveOfferSchema = new Schema<IExclusiveOffer, ExclusiveOfferModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    
    address: {
      type: String,
      trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number] as unknown as [number, number], // TS trick for tuple
            required: true
        }
    },
    image: [
      {
        type: String,
        trim: true,
      }
    ],
    description: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String
    },
    discount: {
      enable: { type: Boolean, default: false },
      value: { type: Number, default: 0 },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

exclusiveOfferSchema.index({ location: "2dsphere" });
exclusiveOfferSchema.index({ published: 1, status: 1 });
exclusiveOfferSchema.index({ user: 1, status: 1, published: 1 });

export const ExclusiveOffer = model<IExclusiveOffer, ExclusiveOfferModel>('ExclusiveOffer', exclusiveOfferSchema);

