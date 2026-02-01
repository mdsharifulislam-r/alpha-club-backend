import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StoryService } from './stories.service';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getMultipleFilesPath(req.files, 'image');
  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await StoryService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Story created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await StoryService.getAllFromDB(req.query,req.user?.role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stories retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await StoryService.getByIdFromDB(req.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const image = getMultipleFilesPath(req.files, 'image');

  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await StoryService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await StoryService.deleteFromDB(req.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story deleted successfully',
    data: result,
  });
});

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const storyId = req.params?.id;
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User ID not found');
  }

  const result = await StoryService.toggleLike(storyId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.liked ? 'Story liked successfully' : 'Story unliked successfully',
    data: result,
  });
});

export const StoryController = {
  create,
  getAll,
  getById,
  update,
  remove,
  toggleLike,
};


