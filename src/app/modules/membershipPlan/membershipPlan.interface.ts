import { Model, Types } from "mongoose";


export type IMemberShipPlan = {
  _id?: string;
  membershipType: string;                // e.g. alpha or alpha_family 
  logo?: string;                         // Plan-specific logo
  title: string;                         // e.g. "Regular Membership"
  description?: string;                  // e.g. "All essential features for individual professionals"
  subDescription?: string;               // e.g. "With the Regular Membership..." (add for secondary plan description)
  features: Types.ObjectId[];            // References to MemberShipFeature documents
  isActive?: boolean;                    // To enable/disable plans
  familyMembershipOptions?: {
    enableFamilyMembers?: boolean;
    familyMembershipLimit?: number; // Maximum allowed family members for family memberships
  };
  createdAt?: Date;
  updatedAt?: Date;
};

export type MemberShipPlanModel = Model<IMemberShipPlan>;
