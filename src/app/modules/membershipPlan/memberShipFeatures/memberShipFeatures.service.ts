import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IMemberShipFeature } from './memberShipFeatures.interface';
import { MemberShipFeature } from './memberShipFeatures.model';
import mongoose from 'mongoose';
import { RedisHelper } from '../../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

const createToDB = async (payload: IMemberShipFeature) => {
  const feature = await MemberShipFeature.create(payload);
  await RedisHelper.bust('features:*', 'plans:*', 'plan:*', 'plan-comparison:*');
  return feature;
};

const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('features', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(MemberShipFeature.find(), query)
    .paginate()
    .search(['title', 'description'])
    .fields()
    .filter()
    .sort();
  
  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('features', result, query, HOUR);
  return result;
};

const getByIdFromDB = async (id: mongoose.Types.ObjectId) => {
  const cache = await RedisHelper.redisGet(`feature:${id}`);
  if (cache) {
    return cache;
  }

  const feature = await MemberShipFeature.findById(id).lean();
  if (!feature) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Feature not found');
  }
  await RedisHelper.redisSet(`feature:${id}`, feature, {}, HOUR);
  return feature;
};

const updateInDB = async (id: string, payload: Partial<IMemberShipFeature> ) => {
  const updated = await MemberShipFeature.findByIdAndUpdate(id, payload, {new: true,}).lean();
  
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Feature not found');
  }
  await RedisHelper.bust('features:*', `feature:${id}:*`, 'plans:*', 'plan:*', 'plan-comparison:*');
  return updated;
};

const deleteFromDB = async (id: mongoose.Types.ObjectId) => {
  const deleted = await MemberShipFeature.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Feature not found');
  }
  await RedisHelper.bust('features:*', `feature:${id}:*`, 'plans:*', 'plan:*', 'plan-comparison:*');
  return deleted;
};

export const MemberShipFeatureService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

