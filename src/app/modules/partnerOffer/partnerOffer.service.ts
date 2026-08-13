import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IPartnerOffer } from './partnerOffer.interface';
import { PartnerOffer } from './partnerOffer.model';

const createToDB = async (payload: IPartnerOffer) => {
  return await PartnerOffer.create(payload);
};

const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(
    PartnerOffer.find().select('name title buttonText colorCard'),
    query
  )
    .paginate()
    .search(['name', 'title', 'location'])
    .fields()
    .filter()
    .sort();
  
  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();
  
  return {
    pagination,
    data,
  };
};

const getByIdFromDB = async (id: string) => {
  const partnerOffer = await PartnerOffer.findById(id).lean();
  
  if (!partnerOffer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner offer not found');
  }
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
  return updated;
};

const deleteFromDB = async (id: string) => {
  const partnerOffer = await PartnerOffer.findById(id).lean();
  if (!partnerOffer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner offer not found');
  }
  const deleted = await PartnerOffer.findByIdAndDelete(id).lean();
  return deleted;
};

export const PartnerOfferService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

