import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import { User } from '../user/user.model';
import { ImemberRedemption } from './member-redemption.interface';
import { MemberRedemption } from './member-redemption.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { DailyAttendance } from '../daily-attendance/daily-attendance.model';
import { ExclusiveOffer } from '../exclusiveOffer/exclusiveOffer.model';
import mongoose from 'mongoose';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const FIVE_MIN = 5 * 60;

/**
 * Create Redemption
 */
const createToDB = async (payload: ImemberRedemption) => {
  // Start and end of today using dayjs
  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();

  // 🔹 Check if user exists
  const isExistUser = await User.findOne({
    application_form: payload.user,
  });

  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User doesn't exist!"
    );
  }

  // Replace payload.user with actual ObjectId
  payload.user = isExistUser._id as any;

  const todayFilter = {
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  const [existing, hasLimit50] = await Promise.all([
    MemberRedemption.findOne({
      user: isExistUser._id,
      ...todayFilter,
    }).select('_id').lean(),
    MemberRedemption.countDocuments(todayFilter),
  ]);

  if (existing) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Redemption already marked for today"
    );
  }

  if (hasLimit50 >= 50) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You have reached 50 redemptions for today');
  }


  // Force today's date
  payload.date = dayjs().toDate();

  const redemption = await MemberRedemption.create(payload);
  await RedisHelper.bust(
    'redemptions:*',
    `redemption-overview:${payload.creator}:*`,
    `redemption-today:${payload.creator}:*`,
  );
  return redemption;
};

/**
 * Get All Redemptions (with pagination, search, filter, sort)
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('redemptions', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(MemberRedemption.find(), query)
    .paginate()
    .search([]) // Add searchable fields if needed
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q =>
    q.populate('user').populate('creator').lean(),
  );
  const result = { pagination, data };
  await RedisHelper.redisSet('redemptions', result, query, FIVE_MIN);
  return result;
};

/**
 * Get Redemption By ID
 */
const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`redemption:${id}`);
  if (cache) {
    return cache;
  }

  const redemption = await MemberRedemption.findById(id)
    .populate('user')
    .populate('creator')
    .lean();

  if (!redemption) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Redemption not found');
  }

  await RedisHelper.redisSet(`redemption:${id}`, redemption, {}, FIVE_MIN);
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

  await RedisHelper.bust('redemptions:*', `redemption:${id}:*`, 'redemption-overview:*', 'redemption-today:*');
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
  await RedisHelper.bust('redemptions:*', `redemption:${id}:*`, 'redemption-overview:*', 'redemption-today:*');
  return deleted;
};

/**
 * Redemption Overview
 */
const redemptionOverview = async (userId: string) => {
  const cache = await RedisHelper.redisGet(`redemption-overview:${userId}`);
  if (cache) {
    return cache;
  }

  // Start and end of today (for attendance check-in)
  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();

  // Start and end of current month (for monthly redemption)
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  const [redemptionStats, todays_attendance_check_in, active_offer] =
    await Promise.all([
      MemberRedemption.aggregate([
        { $match: { creator: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total_redemption: { $sum: 1 },
            redemption_this_month: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$date', startOfMonth] },
                      { $lte: ['$date', endOfMonth] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      DailyAttendance.countDocuments({
        creator: userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),
      ExclusiveOffer.countDocuments({
        user: userId,
        status: 'approved',
        published: true,
      }),
    ]);

  const stats = redemptionStats[0] || {
    total_redemption: 0,
    redemption_this_month: 0,
  };

  const overview = {
    total_redemption: stats.total_redemption,
    redemption_this_month: stats.redemption_this_month,
    todays_attendance_check_in,
    active_offer,
  };
  await RedisHelper.redisSet(`redemption-overview:${userId}`, overview, {}, FIVE_MIN);
  return overview;
};


const overViewRedemption = async (userId: string) => {
  const cache = await RedisHelper.redisGet(`redemption-today:${userId}`);
  if (cache) {
    return cache;
  }

  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();

  const checkIn = await MemberRedemption.countDocuments({
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
  await RedisHelper.redisSet(`redemption-today:${userId}`, result, {}, FIVE_MIN);
  return result;
};

export const MemberRedemptionService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  redemptionOverview,
  overViewRedemption
};