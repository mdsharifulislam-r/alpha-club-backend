import { Model } from "mongoose";

export type IClub = {
  _id?: string;
  name: string;                    // Club name
  image?: string;                  // Club image
  location?: string;               // Club location
  description?: string;            // Club description
  limitOfMember?: number;          // Member limit (if not set, unlimited)
  active?: boolean;                // Active status (admin can set)
  createdAt?: Date;
  updatedAt?: Date;
};

export type ClubModel = Model<IClub>;

