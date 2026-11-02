import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IContactUs } from './contactUs.interface';
import { ContactUs } from './contactUs.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

/**
 * Create ContactUs
 */
const createToDB = async (payload: IContactUs) => {
  const contact = await ContactUs.create(payload);
  await RedisHelper.bust('contact-us:*');
  return contact;
};

/**
 * Get all ContactUs
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('contact-us', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(ContactUs.find(), query)
    .paginate()
    .search(['title', 'description'])
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('contact-us', result, query, HOUR);
  return result;
};

/**
 * Get ContactUs by ID
 */
const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`contact-us-item:${id}`);
  if (cache) {
    return cache;
  }

  const contactUs = await ContactUs.findById(id).lean();

  if (!contactUs) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'ContactUs not found');
  }

  await RedisHelper.redisSet(`contact-us-item:${id}`, contactUs, {}, HOUR);
  return contactUs;
};

/**
 * Update ContactUs
 */
const updateInDB = async (id: string, payload: Partial<IContactUs>) => {
  const updated = await ContactUs.findByIdAndUpdate(
    id,
    { $set: payload },
    {
      new: true,
      runValidators: true,
      strict: true,
    }
  ).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'ContactUs not found');
  }

  await RedisHelper.bust('contact-us:*', `contact-us-item:${id}:*`);
  return updated;
};

/**
 * Delete ContactUs
 */
const deleteFromDB = async (id: string) => {
  const contactUs = await ContactUs.findById(id).lean();

  if (!contactUs) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'ContactUs not found');
  }

  await ContactUs.findByIdAndDelete(id);
  await RedisHelper.bust('contact-us:*', `contact-us-item:${id}:*`);

  return contactUs;
};

export const ContactUsService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

