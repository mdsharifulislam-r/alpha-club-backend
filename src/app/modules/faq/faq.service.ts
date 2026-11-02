import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import { IFaqContact } from './faqContact.interface';
import { FaqContact } from './faqContact.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

/**
 * Create FAQ
 */
const createToDB = async (payload: IFaq) => {
  const faq = await Faq.create(payload);
  await RedisHelper.bust('faqs:*');
  return faq;
};

/**
 * Get all FAQs
 */
const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('faqs', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(Faq.find(), query)
    .paginate()
    .search(['question', 'answer', 'title'])
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('faqs', result, query, HOUR);
  return result;
};

/**
 * Get FAQ by ID
 */
const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`faq:${id}`);
  if (cache) {
    return cache;
  }

  const faq = await Faq.findById(id).lean();

  if (!faq) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
  }

  await RedisHelper.redisSet(`faq:${id}`, faq, {}, HOUR);
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

  await RedisHelper.bust('faqs:*', `faq:${id}:*`);
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
  await RedisHelper.bust('faqs:*', `faq:${id}:*`);

  return faq;
};

/**
 * Create contact form submission
 */
const createContactToDB = async (payload: IFaqContact) => {
  const contact = await FaqContact.create(payload);
  await RedisHelper.bust('faq-contacts:*', 'faq-contacts-admin:*');
  return contact;
};

/**
 * Get all contact submissions
 */
const getAllContactsFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('faq-contacts', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(FaqContact.find(), query)
    .paginate()
    .search(['name', 'email', 'contact', 'message'])
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('faq-contacts', result, query, HOUR);
  return result;
};

/**
 * Get a contact submission by ID
 */
const getContactByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`faq-contact:${id}`);
  if (cache) {
    return cache;
  }

  const contact = await FaqContact.findById(id).lean();

  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact submission not found');
  }

  await RedisHelper.redisSet(`faq-contact:${id}`, contact, {}, HOUR);
  return contact;
};

/**
 * Get all contact submissions for admin use
 */
const getAllContactsForAdminFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('faq-contacts-admin', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(FaqContact.find(), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('faq-contacts-admin', result, query, HOUR);
  return result;
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
