import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IPartnerOffer } from './partnerOffer.interface';
import { PartnerOffer } from './partnerOffer.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

const createToDB = async (payload: IPartnerOffer) => {
  const offer = await PartnerOffer.create(payload);
  await RedisHelper.bust('partner-offers:*');
  return offer;
};

const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('partner-offers', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(
    PartnerOffer.find().select('name title buttonText colorCard'),
    query
  )
    .paginate()
    .search(['name', 'title', 'location'])
    .fields()
    .filter()
    .sort();
  
  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('partner-offers', result, query, HOUR);
  return result;
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`partner-offer:${id}`);
  if (cache) {
    return cache;
  }

  const partnerOffer = await PartnerOffer.findById(id).lean();
  
  if (!partnerOffer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner offer not found');
  }
  await RedisHelper.redisSet(`partner-offer:${id}`, partnerOffer, {}, HOUR);
  return partnerOffer;
};

const updateInDB = async (id: string, payload: Partial<IPartnerOffer>) => {
  const updated = await PartnerOffer.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner offer not found');
  }
  await RedisHelper.bust('partner-offers:*', `partner-offer:${id}:*`);
  return updated;
};

const deleteFromDB = async (id: string) => {
  const partnerOffer = await PartnerOffer.findById(id).lean();
  if (!partnerOffer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner offer not found');
  }
  const deleted = await PartnerOffer.findByIdAndDelete(id).lean();
  await RedisHelper.bust('partner-offers:*', `partner-offer:${id}:*`);
  return deleted;
};

export const PartnerOfferService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

