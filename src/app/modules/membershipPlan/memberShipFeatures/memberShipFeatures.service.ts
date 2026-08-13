import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IMemberShipFeature } from './memberShipFeatures.interface';
import { MemberShipFeature } from './memberShipFeatures.model';
import mongoose from 'mongoose';

const createToDB = async (payload: IMemberShipFeature) => {
  return await MemberShipFeature.create(payload);
};

const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(MemberShipFeature.find(), query)
    .paginate()
    .search(['title', 'description'])
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

const getByIdFromDB = async (id: mongoose.Types.ObjectId) => {
  const feature = await MemberShipFeature.findById(id).lean();
  if (!feature) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Feature not found');
  }
  return feature;
};

const updateInDB = async (id: string, payload: Partial<IMemberShipFeature> ) => {
  const updated = await MemberShipFeature.findByIdAndUpdate(id, payload, {new: true,}).lean();
  
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Feature not found');
  }
  return updated;
};

const deleteFromDB = async (id: mongoose.Types.ObjectId) => {
  const deleted = await MemberShipFeature.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Feature not found');
  }
  return deleted;
};

export const MemberShipFeatureService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

