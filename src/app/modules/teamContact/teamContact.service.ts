import { StatusCodes } from 'http-status-codes';
import { model } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ITeamContact, TeamContactModel } from './teamContact.interface';
import { TeamContact } from './teamContact.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

// ✅ Create a new Team Contact
const createTeamContact = async (payload: ITeamContact) => {
  const contact = await TeamContact.create(payload);
  await RedisHelper.bust('team-contacts:*');
  return contact.toObject();
};

// ✅ Get all Team Contacts with optional query
const getAllTeamContacts = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('team-contacts', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(TeamContact.find(), query)
    .paginate()
    .search(['question', 'answer', 'title'])
    .fields()
    .filter()
    .sort();

  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('team-contacts', result, query, HOUR);
  return result;
};

// ✅ Get a Team Contact by ID
const getTeamContactById = async (id: string) => {
  const cache = await RedisHelper.redisGet(`team-contact:${id}`);
  if (cache) {
    return cache;
  }

  const contact = await TeamContact.findById(id).lean();
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team contact not found');
  }
  await RedisHelper.redisSet(`team-contact:${id}`, contact, {}, HOUR);
  return contact;
};

// ✅ Update a Team Contact by ID
const updateTeamContact = async (id: string, payload: Partial<ITeamContact>) => {
  const updated = await TeamContact.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team contact not found');
  }

  await RedisHelper.bust('team-contacts:*', `team-contact:${id}:*`);
  return updated;
};

// ✅ Delete a Team Contact by ID
const deleteTeamContact = async (id: string) => {
  const contact = await TeamContact.findByIdAndDelete(id).lean();
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team contact not found');
  }
  await RedisHelper.bust('team-contacts:*', `team-contact:${id}:*`);
  return contact;
};

export const TeamContactService = {
  createTeamContact,
  getAllTeamContacts,
  getTeamContactById,
  updateTeamContact,
  deleteTeamContact,
};