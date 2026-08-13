import { model, Schema } from 'mongoose';
import { IMemberShipFeature, MemberShipFeatureModel } from './memberShipFeatures.interface';

const memberShipFeatureSchema = new Schema<IMemberShipFeature, MemberShipFeatureModel>(
  {
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const MemberShipFeature = model<IMemberShipFeature, MemberShipFeatureModel>(
  'MemberShipFeature',
  memberShipFeatureSchema
);

