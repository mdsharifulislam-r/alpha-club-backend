import { Model } from 'mongoose';

export type IFaqContact = {
  _id?: string;
  name: string;
  contact: string;
  email: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FaqContactModel = Model<IFaqContact>;


