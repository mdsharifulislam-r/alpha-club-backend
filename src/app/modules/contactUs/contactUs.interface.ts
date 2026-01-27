import { Model } from "mongoose";

export type IContactUs = {
  _id?: string;
  image?: string;
  title: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ContactUsModel = Model<IContactUs>;

