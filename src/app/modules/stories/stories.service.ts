import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IStory } from './stories.interface';
import { Story } from './stories.model';
import { StoryLike } from './storiesLike/storiesLike.model';
import mongoose from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

const createToDB = async (payload: IStory) => {
  return await Story.create(payload);
};

const getAllFromDB = async (query: Record<string, any>, role: string) => {
  // If role is 'USER', only fetch stories with published: true
  let appQuery = query;

  // If the user's role is 'USER', only fetch published stories
  if (role && role ===  USER_ROLES.USER) {
    query.published = true
  }

  const qb = new QueryBuilder(Story.find(), appQuery)
    .paginate()
    .search(['title', 'description'])
    .fields()
    .filter()
    .sort();

  const stories = await qb.modelQuery.lean();

  const storyIds = stories.map((story: any) => story._id);
  let likeCounts: any[] = [];

  if (storyIds.length > 0) {
    likeCounts = await StoryLike.aggregate([
      {
        $match: {
          story: {
            $in: storyIds.map(
              (id: any) => new mongoose.Types.ObjectId(id)
            ),
          },
        },
      },
      {
        $group: {
          _id: '$story',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  const likeCountMap = new Map(
    likeCounts.map((item: any) => [item._id.toString(), item.count])
  );

  const data = stories.map((story: any) => ({
    ...story,
    likeCount: likeCountMap.get(story._id.toString()) || 0,
  }));

  const pagination = await qb.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

const getByIdFromDB = async (id: string) => {
  const story = await Story.findById(id).lean();

  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  const likeCount = await StoryLike.countDocuments({ story: id });

  return {
    ...story,
    likeCount,
  };
};

const updateInDB = async (id: string, payload: Partial<IStory>) => {
  const updated = await Story.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const story = await Story.findById(id).lean();
  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  await StoryLike.deleteMany({ story: id });

  const deleted = await Story.findByIdAndDelete(id).lean();
  return deleted;
};

const toggleLike = async (storyId: string, userId: string) => {
  const story = await Story.findById(storyId).lean();
  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  const existingLike = await StoryLike.findOne({
    user: userId,
    story: storyId,
  }).lean();

  if (existingLike) {
    await StoryLike.findByIdAndDelete(existingLike._id);
  } else {
    await StoryLike.create({
      user: userId,
      story: storyId,
    });
  }

  const likeCount = await StoryLike.countDocuments({ story: storyId });

  return {
    liked: !existingLike,
    likeCount,
  };
};

export const StoryService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  toggleLike,
};


