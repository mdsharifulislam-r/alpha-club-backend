import { StatusCodes } from 'http-status-codes';
import { model } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ITeamContact, TeamContactModel } from './teamContact.interface';
import { TeamContact } from './teamContact.model';
import QueryBuilder from '../../builder/QueryBuilder';

// ✅ Create a new Team Contact
const createTeamContact = async (payload: ITeamContact) => {
  const contact = await TeamContact.create(payload);
  return contact.toObject();
};

// ✅ Get all Team Contacts with optional query
const getAllTeamContacts = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(TeamContact.find(), query)
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

// ✅ Get a Team Contact by ID
const getTeamContactById = async (id: string) => {
  const contact = await TeamContact.findById(id).lean();
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team contact not found');
  }
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

  return updated;
};

// ✅ Delete a Team Contact by ID
const deleteTeamContact = async (id: string) => {
  const contact = await TeamContact.findByIdAndDelete(id).lean();
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team contact not found');
  }
  return contact;
};

export const TeamContactService = {
  createTeamContact,
  getAllTeamContacts,
  getTeamContactById,
  updateTeamContact,
  deleteTeamContact,
};