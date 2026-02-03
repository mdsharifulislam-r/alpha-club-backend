import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IClub } from './club.interface';
import { Club } from './club.model';
import { ClubMember } from './clubMembers/clubMember.model';
import mongoose from 'mongoose';

const createToDB = async (payload: IClub) => {
  if (payload?.limitOfMember)
    payload.limitOfMember = Number(payload.limitOfMember);

  return await Club.create(payload);
};

const getAllFromDB = async (query: Record<string, any>) => {
  // Get clubs with member count (only active clubs for public view)
  const qb = new QueryBuilder(Club.find({ active: true }), query)
    .paginate()
    .search(['name', 'location'])
    .fields()
    .filter()
    .sort();

  const clubs = await qb.modelQuery.lean();

  // Get member counts for each club
  const clubIds = clubs.map((club: any) => club._id);
  let memberCounts: any[] = [];

  if (clubIds.length > 0) {
    memberCounts = await ClubMember.aggregate([
      {
        $match: {
          club: {
            $in: clubIds.map((id: any) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      {
        $group: {
          _id: '$club',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // Create a map of clubId -> memberCount
  const memberCountMap = new Map(
    memberCounts.map((item: any) => [item._id.toString(), item.count])
  );

  // Add member count to each club and select only required fields: image, name, numberOfMembers
  const data = clubs.map((club: any) => ({
    _id: club._id,
    image: club.image,
    name: club.name,
    limitOfMember:club.limitOfMember,
    numberOfMembers: memberCountMap.get(club._id.toString()) || 0,
  }));

  const pagination = await qb.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

const getByIdFromDB = async (id: string) => {
  const club = await Club.findById(id).lean();

  if (!club) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  // Get member count
  const memberCount = await ClubMember.countDocuments({ club: id });

  return {
    ...club,
    numberOfMembers: memberCount,
  };
};

const updateInDB = async (id: string, payload: Partial<IClub>) => {
  if (payload?.limitOfMember)
    payload.limitOfMember = Number(payload.limitOfMember);

  const updated = await Club.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const club = await Club.findById(id).lean();
  if (!club) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  // Delete all club members first
  await ClubMember.deleteMany({ club: id });

  const deleted = await Club.findByIdAndDelete(id).lean();
  return deleted;
};

const joinClub = async (clubId: string, userId: string) => {
  // Check if club exists and is active
  const club = await Club.findById(clubId).lean();
  if (!club) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  if (!club.active) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Club is not active');
  }

  // Check if user is already a member
  const existingMember = await ClubMember.findOne({
    user: userId,
    club: clubId,
  }).lean();

  if (existingMember) {
    // User is already a member, remove them (toggle off)
    await ClubMember.findByIdAndDelete(existingMember._id);
    return { joined: false, message: 'Left club successfully' };
  }

  // Check member limit if set
  if (club.limitOfMember) {
    const currentMemberCount = await ClubMember.countDocuments({
      club: clubId,
    });
    if (currentMemberCount >= club.limitOfMember) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Club member limit reached');
    }
  }

  // Add user to club
  await ClubMember.create({
    user: userId,
    club: clubId,
  });

  return { joined: true, message: 'Joined club successfully' };
};

const leaveClub = async (clubId: string, userId: string) => {
  const club = await Club.findById(clubId).lean();
  if (!club) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  const member = await ClubMember.findOneAndDelete({
    user: userId,
    club: clubId,
  }).lean();

  if (!member) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'You are not a member of this club'
    );
  }

  return { message: 'Left club successfully' };
};

export const ClubService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  joinClub,
  leaveClub,
};
