import { model, Schema, Types } from "mongoose";
import { DailyAttendanceModel, IDailyAttendance } from "./daily-attendance.interface";


const dailyAttendanceSchema = new Schema<
  IDailyAttendance,
  DailyAttendanceModel
>(
  {
    creator: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DailyAttendance = model< IDailyAttendance,DailyAttendanceModel>( "DailyAttendance", dailyAttendanceSchema);