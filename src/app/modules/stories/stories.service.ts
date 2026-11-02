import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { aggregateById, aggregatePage, attachCount } from '../../builder/aggregatePage';
import QueryBuilder from '../../builder/QueryBuilder';
import { IStory } from './stories.interface';
import { Story } from './stories.model';
import { StoryLike } from './storiesLike/storiesLike.model';
import { USER_ROLES } from '../../../enums/user';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

const createToDB = async (payload: IStory) => {
  const story = await Story.create(payload);
  await RedisHelper.bust('stories:*');
  return story;
};

const getAllFromDB = async (query: Record<string, any>, role: string) => {
  // If role is 'USER', only fetch stories with published: true
  let appQuery = query;

  // If the user's role is 'USER', only fetch published stories
  if (role && role ===  USER_ROLES.USER) {
    query.published = true
  }

  const cacheKey = `stories:${role || 'public'}`;
  const cache = await RedisHelper.redisGet(cacheKey, query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(Story.find(), appQuery)
    .search(['title', 'description'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const { data: stories, pagination } = await aggregatePage(
    Story,
    qb,
    attachCount(StoryLike.collection.collectionName, 'story', 'likeCount'),
    ['likeCount'],
  );

  const data = stories.map((story: any) => ({
    ...story,
    likeCount: story.likeCount || 0,
  }));

  const result = { pagination, data };
  await RedisHelper.redisSet(cacheKey, result, query, HOUR);
  return result;
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`story:${id}`);
  if (cache) {
    return cache;
  }

  const story = await aggregateById(
    Story,
    id,
    attachCount(StoryLike.collection.collectionName, 'story', 'likeCount'),
  );

  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  await RedisHelper.redisSet(`story:${id}`, story, {}, HOUR);
  return story;
};

const updateInDB = async (
  id: string,
  payload: Partial<IStory> & { removedFiles?: string[] }
) => {
  // 1️⃣ Get existing images
  const existing = await Story.findById(id).select('image').lean();

  let existingImages: string[] = Array.isArray(existing?.image)
    ? existing.image.map(String)
    : [];

  // 2️⃣ Handle removedFiles
  if (Array.isArray(payload.removedFiles) && payload.removedFiles.length > 0) {
    const removedFilesSet = new Set(payload.removedFiles.map(String));
    existingImages = existingImages.filter(
      img => !removedFilesSet.has(img)
    );
  }

  // 3️⃣ Handle image update logic
  if (Object.prototype.hasOwnProperty.call(payload, 'image')) {
    let newImages: string[] = [];

    if (Array.isArray(payload.image)) {
      newImages = payload.image.map(String).filter(Boolean);
    } else if (payload.image) {
      newImages = [String(payload.image)];
    }

    if (newImages.length > 0) {
      payload.image = Array.from(
        new Set([...existingImages, ...newImages])
      );
    } else {
      payload.image = existingImages;
    }
  } else if (payload.removedFiles?.length) {
    // Only removedFiles sent
    payload.image = existingImages;
  }

  // 4️⃣ Clean payload
  delete (payload as any).removedFiles;

  // 5️⃣ Update DB
  const updated = await Story.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  await RedisHelper.bust('stories:*', `story:${id}:*`);
  return updated;
};


const deleteFromDB = async (id: string) => {
  const deleted = await Story.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  await StoryLike.deleteMany({ story: id });
  await RedisHelper.bust('stories:*', `story:${id}:*`);
  return deleted;
};

const toggleLike = async (storyId: string, userId: string) => {
  const [story, existingLike] = await Promise.all([
    Story.findById(storyId).select('_id').lean(),
    StoryLike.findOne({ user: userId, story: storyId }).lean(),
  ]);

  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  if (existingLike) {
    await StoryLike.findByIdAndDelete(existingLike._id);
  } else {
    await StoryLike.create({
      user: userId,
      story: storyId,
    });
  }

  const likeCount = await StoryLike.countDocuments({ story: storyId });
  await RedisHelper.bust('stories:*', `story:${storyId}:*`);

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


