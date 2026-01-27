import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IContactUs } from './contactUs.interface';
import { ContactUs } from './contactUs.model';

/**
 * Create ContactUs
 */
const createToDB = async (payload: IContactUs) => {
  return await ContactUs.create(payload);
};

/**
 * Get all ContactUs
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(ContactUs.find(), query)
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

/**
 * Get ContactUs by ID
 */
const getByIdFromDB = async (id: string) => {
  const contactUs = await ContactUs.findById(id).lean();

  if (!contactUs) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'ContactUs not found');
  }

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

  return contactUs;
};

export const ContactUsService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

