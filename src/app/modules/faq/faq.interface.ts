import { Model } from "mongoose";

export type IFaq = {
  _id?: string;
  title: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FaqModel = Model<IFaq>;

