import { Model, Types } from "mongoose";

export type IMemberShipFeature = {
  _id?: string;
  icon: string;            // Icon representing the feature (e.g. icon name or url)
  title: string;           // "Digital Membership Card", "Exclusive Offers & Discounts", etc.
  description: string;     // e.g. "Access your digital membership card anytime, anywhere"
  isActive?: boolean;      // To enable/disable features
  createdAt?: Date;
  updatedAt?: Date;
};

export type MemberShipFeatureModel = Model<IMemberShipFeature>;

