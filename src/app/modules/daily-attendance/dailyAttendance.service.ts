import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { DailyAttendance } from './daily-attendance.model';
import { IDailyAttendance } from './daily-attendance.interface';
import dayjs from 'dayjs';
import { User } from '../user/user.model';
import mongoose, { ObjectId } from 'mongoose';

/**
 * Create Attendance
 */
const createToDB = async (payload: IDailyAttendance) => {
  // Start and end of today using dayjs
  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();
  
  const isExistUser = await User.findOne({application_form: payload.user});
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  console.log('isExistUser', isExistUser)
   payload.user = isExistUser._id as any;
  // Check if attendance already marked today
  const existing = await DailyAttendance.findOne({
    user: isExistUser._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  const hasLimit50 = await DailyAttendance.countDocuments({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (hasLimit50 >= 50) {
    throw new ApiError(StatusCodes.BAD_REQUEST,'You have reached 50 attendances for today');
  }

  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST,'Attendance already marked for today');
  }

  // Force today's date
  payload.date = dayjs().toDate();

  return await DailyAttendance.create(payload);
};

/**
 * Get All Attendance (with pagination, search, filter, sort)
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(DailyAttendance.find(), query)
    .paginate()
    .search([]) // No searchable fields unless you want to add
    .fields()
    .filter()
    .sort();

  const data = await qb.modelQuery
    .populate('user')
    .populate('creator')
    .lean();

  const pagination = await qb.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

/**
 * Get Attendance By ID
 */
const getByIdFromDB = async (id: string) => {
  const attendance = await DailyAttendance.findById(id)
    .populate('user')
    .populate('creator')
    .lean();

  if (!attendance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Attendance not found');
  }

  return attendance;
};

/**
 * Update Attendance
 */
const updateInDB = async (
  id: string,
  payload: Partial<IDailyAttendance>
) => {
  const updated = await DailyAttendance.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Attendance not found');
  }

  return updated;
};

/**
 * Delete Attendance
 */
const deleteFromDB = async (id: string) => {
  const attendance = await DailyAttendance.findById(id).lean();

  if (!attendance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Attendance not found');
  }

  const deleted = await DailyAttendance.findByIdAndDelete(id).lean();
  return deleted;
};


const attendanceOverview = async (userId:string) => {
  
  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();

  const checkIn = await DailyAttendance.countDocuments({
    creator: userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
  
  const remaining = 50 - checkIn;
  const result = {
    checkIn,
    remaining
  };

 return result;
  
};

export const DailyAttendanceService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  attendanceOverview
};