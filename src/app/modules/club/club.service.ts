import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { aggregateById, aggregatePage, attachCount } from '../../builder/aggregatePage';
import QueryBuilder from '../../builder/QueryBuilder';
import { IClub } from './club.interface';
import { Club } from './club.model';
import { ClubMember } from './clubMembers/clubMember.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const createToDB = async (payload: IClub) => {
  if (payload?.limitOfMember)
    payload.limitOfMember = Number(payload.limitOfMember);

  const club = await Club.create(payload);
  await RedisHelper.keyDelete(`clubs:*`)
  await RedisHelper.bust('statistics:*');
  return club;
};

const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('clubs',query)
  if (cache) {
    return cache;
  }
  const qb = new QueryBuilder(Club.find({ active: true }), query)
    .search(['name', 'location'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const { data: clubs, pagination } = await aggregatePage(
    Club,
    qb,
    attachCount(ClubMember.collection.collectionName, 'club', 'numberOfMembers'),
    ['numberOfMembers'],
  );

  const data = clubs.map((club: any) => ({
    _id: club._id,
    image: club.image,
    name: club.name,
    limitOfMember: club.limitOfMember,
    numberOfMembers: club.numberOfMembers || 0,
  }));

  await RedisHelper.redisSet('clubs',{data,pagination},query,60*60)

  return {
    pagination,
    data,
  };
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`club:${id}`)
  if (cache) {
    return cache;
  }
  const club = await aggregateById(
    Club,
    id,
    attachCount(ClubMember.collection.collectionName, 'club', 'numberOfMembers'),
  );

  if (!club) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  await RedisHelper.redisSet(`club:${id}`,club,{},60*60)

  return club;
};

const updateInDB = async (id: string, payload: Partial<IClub>) => {
  if (payload?.limitOfMember)
    payload.limitOfMember = Number(payload.limitOfMember);

  const updated = await Club.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  await RedisHelper.keyDelete(`club:${id}:*`)
  await RedisHelper.keyDelete(`clubs:*`)

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const deleted = await Club.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  await ClubMember.deleteMany({ club: id });
  await RedisHelper.keyDelete(`club:${id}:*`)
  await RedisHelper.keyDelete(`clubs:*`)
  await RedisHelper.bust('statistics:*');
  return deleted;
};

const joinClub = async (clubId: string, userId: string) => {
  const [club, existingMember] = await Promise.all([
    Club.findById(clubId).lean(),
    ClubMember.findOne({ user: userId, club: clubId }).lean(),
  ]);

  if (!club) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }

  if (!club.active) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Club is not active');
  }

  if (existingMember) {
    // User is already a member, remove them (toggle off)
    await ClubMember.findByIdAndDelete(existingMember._id);
    await RedisHelper.keyDelete(`club:${clubId}:*`)
    await RedisHelper.keyDelete(`clubs:*`)
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
  await RedisHelper.keyDelete(`club:${clubId}:*`)
  await RedisHelper.keyDelete(`clubs:*`)

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

  await RedisHelper.keyDelete(`club:${clubId}:*`)
  await RedisHelper.keyDelete(`clubs:*`)

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
