import mongoose, { Model } from 'mongoose';
import { IUser } from '../user/user.interface';

export type ITeamContact = {
  _id?: string;
  partner: mongoose.Types.ObjectId | IUser;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TeamContactModel = Model<ITeamContact>;