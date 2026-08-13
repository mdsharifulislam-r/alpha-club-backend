import { Model, Types } from "mongoose";

export type IClubMember = {
  _id?: string;
  user: Types.ObjectId;            // Reference to User
  club: Types.ObjectId;            // Reference to Club
  createdAt?: Date;
  updatedAt?: Date;
};

export type ClubMemberModel = Model<IClubMember>;

