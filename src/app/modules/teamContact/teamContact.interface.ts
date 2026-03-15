import { Model } from 'mongoose';

export type ITeamContact = {
  _id?: string;
  name: string;
  title?: string;
  phone: string;
  email: string;
  location?:string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TeamContactModel = Model<ITeamContact>;