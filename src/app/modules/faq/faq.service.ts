import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import { IFaqContact } from './faqContact.interface';
import { FaqContact } from './faqContact.model';

/**
 * Create FAQ
 */
const createToDB = async (payload: IFaq) => {
  return await Faq.create(payload);
};

/**
 * Get all FAQs
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Faq.find(), query)
    .paginate()
    .search(['question', 'answer', 'title'])
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
 * Get FAQ by ID
 */
const getByIdFromDB = async (id: string) => {
  const faq = await Faq.findById(id).lean();

  if (!faq) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
  }

  return faq;
};

/**
 * Update FAQ
 */
const updateInDB = async (id: string, payload: Partial<IFaq>) => {
  const updated = await Faq.findByIdAndUpdate(
    id,
    { $set: payload },
    {
      new: true,
      runValidators: true,
      strict: true,
    }
  ).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
  }

  return updated;
};

/**
 * Delete FAQ
 */
const deleteFromDB = async (id: string) => {
  const faq = await Faq.findById(id).lean();

  if (!faq) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
  }

  await Faq.findByIdAndDelete(id);

  return faq;
};

/**
 * Create contact form submission
 */
const createContactToDB = async (payload: IFaqContact) => {
  return await FaqContact.create(payload);
};

/**
 * Get all contact submissions
 */
const getAllContactsFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(FaqContact.find(), query)
    .paginate()
    .search(['name', 'email', 'contact', 'message'])
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
 * Get a contact submission by ID
 */
const getContactByIdFromDB = async (id: string) => {
  const contact = await FaqContact.findById(id).lean();

  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact submission not found');
  }

  return contact;
};

/**
 * Get all contact submissions for admin use
 */
const getAllContactsForAdminFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(FaqContact.find(), query)
    .paginate()
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

export const FaqService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  createContactToDB,
  getAllContactsFromDB,
  getContactByIdFromDB,
  getAllContactsForAdminFromDB,
};
