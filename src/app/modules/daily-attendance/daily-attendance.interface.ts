import { Model, mongo } from "mongoose";
import { IUser } from "../user/user.interface";

export type IDailyAttendance = {
  _id?: string;
  creator:mongo.ObjectId | IUser;
  user:mongo.ObjectId | IUser;
  date:Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type DailyAttendanceModel = Model<IDailyAttendance>;

