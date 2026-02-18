import { Document, Model } from "mongoose";
import { PartnerShipStatus } from "./partnerRequest.constant";

// Interface for the membership application
export interface IPartnerRequest extends Document {
  _id?: string; // MongoDB generated
  partnerShipId?: string; // e.g., AC-00001 (auto-generated)

  companyName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  website: string;
  about: string;

  partnerShipStatus: PartnerShipStatus;

  // Timestamps added automatically by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Model type
export type PartnerRequestModel = Model<IPartnerRequest>;
