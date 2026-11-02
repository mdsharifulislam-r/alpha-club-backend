import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { ISponsor } from './sponsor.interface';
import { Sponsor } from './sponsor.model';
import { USER_ROLES } from '../../../enums/user';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

const createToDB = async (payload: ISponsor) => {
  const sponsor = await Sponsor.create(payload);
  await RedisHelper.bust('sponsors:*');
  return sponsor;
};

const getAllFromDB = async (query: Record<string, any>, role: string) => {
  const cacheKey = `sponsors:${role || 'public'}`;
  const cache = await RedisHelper.redisGet(cacheKey, query);
  if (cache) {
    return cache;
  }

  // If the role is 'user', only show sponsors where publishing is true
  const filter: Record<string, any> = {};

  if (role === USER_ROLES.USER) {
    filter.publishing = true;
  }

  const qb = new QueryBuilder(
    Sponsor.find(filter).select('logo title location publishing'),
    query
  )
    .paginate()
    .search(['title', 'location'])
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet(cacheKey, result, query, HOUR);
  return result;
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`sponsor:${id}`);
  if (cache) {
    return cache;
  }

  const sponsor = await Sponsor.findById(id).lean();

  if (!sponsor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }
  await RedisHelper.redisSet(`sponsor:${id}`, sponsor, {}, HOUR);
  return sponsor;
};

const updateInDB = async (id: string, payload: Partial<ISponsor>) => {
  // Convert publishing to boolean if it's string 'true' or 'false'
  if (
    Object.prototype.hasOwnProperty.call(payload, 'publishing') &&
    typeof payload.publishing === 'string'
  ) {
    const publishingStr = payload.publishing as unknown as string;
    if (publishingStr.toLowerCase() === 'true') {
      payload.publishing = true;
    } else if (publishingStr.toLowerCase() === 'false') {
      payload.publishing = false;
    }
  }

  const updated = await Sponsor.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }
  await RedisHelper.bust('sponsors:*', `sponsor:${id}:*`);
  return updated;
};

const deleteFromDB = async (id: string) => {
  const sponsor = await Sponsor.findById(id).lean();
  if (!sponsor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }
  const deleted = await Sponsor.findByIdAndDelete(id).lean();
  await RedisHelper.bust('sponsors:*', `sponsor:${id}:*`);
  return deleted;
};

export const SponsorService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};