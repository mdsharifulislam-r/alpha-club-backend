import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ICategory } from './category.interface';
import { Category } from './category.model';
import { RedisHelper } from '../../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

const createToDB = async (payload: ICategory) => {
  // convert name to lowercase and replace spaces with underscore
  const name = payload.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Category with this name already exists'
    );
  }

  // save modified name in db
  const category = await Category.create({
    ...payload,
    name,
  });
  await RedisHelper.bust('categories:*', 'offers:*', 'my-offers:*', 'favourite-offers:*');
  return category;
};

const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('categories', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(
    Category.find(),
    query
  )
    .paginate()
    .search(['name'])
    .fields()
    .filter()
    .sort();
  
  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('categories', result, query, HOUR);
  return result;
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`category:${id}`);
  if (cache) {
    return cache;
  }

  const category = await Category.findById(id).lean();
  
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  await RedisHelper.redisSet(`category:${id}`, category, {}, HOUR);
  return category;
};

const updateInDB = async (id: string, payload: Partial<ICategory>) => {
  if (payload.name) {
    const existingCategory = await Category.findOne({ 
      name: payload.name,
      _id: { $ne: id }
    });
    if (existingCategory) {
      throw new ApiError(StatusCodes.CONFLICT, 'Category with this name already exists');
    }
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  await RedisHelper.bust(
    'categories:*',
    `category:${id}:*`,
    'offers:*',
    'my-offers:*',
    'favourite-offers:*',
  );
  return updated;
};

const deleteFromDB = async (id: string) => {
  const category = await Category.findById(id).lean();
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  const deleted = await Category.findByIdAndDelete(id).lean();
  await RedisHelper.bust(
    'categories:*',
    `category:${id}:*`,
    'offers:*',
    'my-offers:*',
    'favourite-offers:*',
  );
  return deleted;
};

export const CategoryService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

