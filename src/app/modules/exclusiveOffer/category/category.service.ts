import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ICategory } from './category.interface';
import { Category } from './category.model';

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
  return await Category.create({
    ...payload,
    name,
  });
};

const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(
    Category.find(),
    query
  )
    .paginate()
    .search(['name'])
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

const getByIdFromDB = async (id: string) => {
  const category = await Category.findById(id).lean();
  
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
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
  return updated;
};

const deleteFromDB = async (id: string) => {
  const category = await Category.findById(id).lean();
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  const deleted = await Category.findByIdAndDelete(id).lean();
  return deleted;
};

export const CategoryService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

