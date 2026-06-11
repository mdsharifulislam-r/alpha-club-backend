import { Model } from "mongoose";

export type IPartnerOffer = {
  _id?: string;
  name: string;                    // Partner offer name
  title: string;                    // Partner offer title
  image?: string;                   // Partner offer image
  description?: string;             // Partner offer description
  businessDescription?: string;     // Business description for the offer
  location?: string;                 // Partner offer location
  buttonText?: string;              // Button text for the offer
  colorCard?: string;               // Color card/theme color
  createdAt?: Date;
  updatedAt?: Date;
};

export type PartnerOfferModel = Model<IPartnerOffer>;

