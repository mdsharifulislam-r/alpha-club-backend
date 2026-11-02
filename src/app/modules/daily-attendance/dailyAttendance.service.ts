import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { DailyAttendance } from './daily-attendance.model';
import { IDailyAttendance } from './daily-attendance.interface';
import dayjs from 'dayjs';
import { User } from '../user/user.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const FIVE_MIN = 5 * 60;
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

   payload.user = isExistUser._id as any;

  const todayFilter = {
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  const [existing, hasLimit50] = await Promise.all([
    DailyAttendance.findOne({
      user: isExistUser._id,
      ...todayFilter,
    }).select('_id').lean(),
    DailyAttendance.countDocuments(todayFilter),
  ]);

  if (hasLimit50 >= 50) {
    throw new ApiError(StatusCodes.BAD_REQUEST,'You have reached 50 attendances for today');
  }

  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST,'Attendance already marked for today');
  }

  // Force today's date
  payload.date = dayjs().toDate();

  const attendance = await DailyAttendance.create(payload);
  await RedisHelper.bust(
    'attendances:*',
    `attendance-overview:${payload.creator}:*`,
    `redemption-overview:${payload.creator}:*`,
  );
  return attendance;
};

/**
 * Get All Attendance (with pagination, search, filter, sort)
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('attendances', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(DailyAttendance.find(), query)
    .paginate()
    .search([]) // No searchable fields unless you want to add
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q =>
    q.populate('user').populate('creator').lean(),
  );
  const result = { pagination, data };
  await RedisHelper.redisSet('attendances', result, query, FIVE_MIN);
  return result;
};

/**
 * Get Attendance By ID
 */
const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`attendance:${id}`);
  if (cache) {
    return cache;
  }

  const attendance = await DailyAttendance.findById(id)
    .populate('user')
    .populate('creator')
    .lean();

  if (!attendance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Attendance not found');
  }

  await RedisHelper.redisSet(`attendance:${id}`, attendance, {}, FIVE_MIN);
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

  await RedisHelper.bust('attendances:*', `attendance:${id}:*`, 'attendance-overview:*', 'redemption-overview:*');
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
  await RedisHelper.bust('attendances:*', `attendance:${id}:*`, 'attendance-overview:*', 'redemption-overview:*');
  return deleted;
};


const attendanceOverview = async (userId:string) => {
  const cache = await RedisHelper.redisGet(`attendance-overview:${userId}`);
  if (cache) {
    return cache;
  }
  
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
  await RedisHelper.redisSet(`attendance-overview:${userId}`, result, {}, FIVE_MIN);
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