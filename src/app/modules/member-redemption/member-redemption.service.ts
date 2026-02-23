import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import { User } from '../user/user.model';
import { ImemberRedemption } from './member-redemption.interface';
import { MemberRedemption } from './member-redemption.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { DailyAttendance } from '../daily-attendance/daily-attendance.model';
import { ExclusiveOffer } from '../exclusiveOffer/exclusiveOffer.model';

/**
 * Create Redemption
 */
const createToDB = async (payload: ImemberRedemption) => {
  // Check if the user exists
  const isExistUser = await User.findOne({ application_form: payload.user });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  payload.user = isExistUser._id as any;

  // 🔹 Check if redemption already exists for today
  // const startOfDay = dayjs().startOf('day').toDate();
  // const endOfDay = dayjs().endOf('day').toDate();

  const existing = await MemberRedemption.findOne({
    user: isExistUser._id,
    // date: {
    //   $gte: startOfDay,
    //   $lte: endOfDay,
    // },
  });

  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Redemption already exists for this member');
  }

  // Force today's date
  payload.date = dayjs().toDate();

  return await MemberRedemption.create(payload);
};

/**
 * Get All Redemptions (with pagination, search, filter, sort)
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(MemberRedemption.find(), query)
    .paginate()
    .search([]) // Add searchable fields if needed
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
 * Get Redemption By ID
 */
const getByIdFromDB = async (id: string) => {
  const redemption = await MemberRedemption.findById(id)
    .populate('user')
    .populate('creator')
    .lean();

  if (!redemption) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Redemption not found');
  }

  return redemption;
};

/**
 * Update Redemption
 */
const updateInDB = async (id: string, payload: Partial<ImemberRedemption>) => {
  const updated = await MemberRedemption.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Redemption not found');
  }

  return updated;
};

/**
 * Delete Redemption
 */
const deleteFromDB = async (id: string) => {
  const redemption = await MemberRedemption.findById(id).lean();

  if (!redemption) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Redemption not found');
  }

  const deleted = await MemberRedemption.findByIdAndDelete(id).lean();
  return deleted;
};

/**
 * Redemption Overview
 */
const redemptionOverview = async (userId: string) => {
  // Start and end of today (for attendance check-in)
  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();

  // Start and end of current month (for monthly redemption)
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  // Total redemptions overall
  const total_redemption = await MemberRedemption.countDocuments({ creator: userId });

  // Redemptions in current month
  const redemption_this_month = await MemberRedemption.countDocuments({
    creator: userId,
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  });

  // Attendance check-ins today
  const todays_attendance_check_in = await DailyAttendance.countDocuments({
    creator: userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  const active_offer = await ExclusiveOffer.countDocuments({
    user:userId,
    status:"approved",
    published:true
  })

  return {
    total_redemption,
    redemption_this_month,
    todays_attendance_check_in,
    active_offer
  };
};


export const MemberRedemptionService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  redemptionOverview,
};