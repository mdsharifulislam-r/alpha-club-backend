import { model, Schema, Types } from 'mongoose';
import {
  IMemberShipPlan,
  MemberShipPlanModel,
} from './membershipPlan.interface';


const memberShipPlanSchema = new Schema<IMemberShipPlan, MemberShipPlanModel>(
  {
    membershipType: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subDescription: {
      type: String,
      trim: true,
    },
    features: [
      {
        type: Types.ObjectId,
        ref: 'MemberShipFeature',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    familyMembershipOptions: {
      enableFamilyMembers: {
        type: Boolean,
        default: false,
      },
      familyMembershipLimit: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

export const MemberShipPlan = model<IMemberShipPlan, MemberShipPlanModel>(
  'MemberShipPlan',
  memberShipPlanSchema
);
