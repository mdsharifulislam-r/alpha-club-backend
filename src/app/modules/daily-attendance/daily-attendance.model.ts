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

dailyAttendanceSchema.index({ creator: 1, date: 1 });
dailyAttendanceSchema.index({ user: 1, date: 1 });
dailyAttendanceSchema.index({ date: 1 });

export const DailyAttendance = model< IDailyAttendance,DailyAttendanceModel>( "DailyAttendance", dailyAttendanceSchema);