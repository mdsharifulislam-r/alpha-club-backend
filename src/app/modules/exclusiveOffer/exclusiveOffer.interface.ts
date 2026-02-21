import { Model, Types } from "mongoose";
import { IUser } from "../user/user.interface";

export type IExclusiveOfferLocation = {
  type: "Point";                            // GeoJSON type
  coordinates: [number, number];            // [longitude, latitude]
};

export type IExclusiveOffer = {
  _id?: string;
  user: Types.ObjectId | IUser;                     // Reference to User
  name: string;                             // Exclusive offer name
  title: string;                            // Exclusive offer title
  location?: IExclusiveOfferLocation;       // GeoJSON location
  address?: string;                         // GeoJSON location
  image?: string[];                         // Array of exclusive offer images
  description?: string;                     // Exclusive offer description
  category?: Types.ObjectId;                // Reference to Category
  discount?: {
    enable: boolean;
    value: number;
  };
  status?: 'pending' | 'approved' | 'rejected';
  published?: boolean;                      // Whether the offer is published
  createdAt?: Date;
  updatedAt?: Date;
};

export type ExclusiveOfferModel = Model<IExclusiveOffer>;

