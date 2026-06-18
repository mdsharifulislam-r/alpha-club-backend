import { Model } from "mongoose";

export type ICategory = {
  _id?: string;
  name: string;                    // Category name
  slug: string;                    // Category slug for URL
  createdAt?: Date;
  updatedAt?: Date;
};

export type CategoryModel = Model<ICategory>;

