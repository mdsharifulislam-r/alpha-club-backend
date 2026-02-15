import { Model } from 'mongoose';

export type IContactForm = {
  _id?: string;
  name: string;
  contact: string;
  email: string;
  message?: string;
  membershipType?:string;
  memberShipId?:string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ContactFormModel = Model<IContactForm>;