import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ClubService } from './club.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await ClubService.createToDB(data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Club created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ClubService.getAllFromDB(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Clubs retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ClubService.getByIdFromDB(req.params?.id as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Club retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const image = getSingleFilePath(req.files, 'image');
  
  const data = {
    ...req.body,
    ...(image && { image }),
  };
  
  const result = await ClubService.updateInDB(id, data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Club updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await ClubService.deleteFromDB(req.params?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Club deleted successfully',
    data: result,
  });
});

const joinClub = catchAsync(async (req: Request, res: Response) => {
  const clubId = req.params?.id;
  const userId = req.user?.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  const result = await ClubService.joinClub(clubId, userId);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result,
  });
});

const leaveClub = catchAsync(async (req: Request, res: Response) => {
  const clubId = req.params?.id;
  const userId = req.user?.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  const result = await ClubService.leaveClub(clubId, userId);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result,
  });
});

export const ClubController = {
  create,
  getAll,
  getById,
  update,
  remove,
  joinClub,
  leaveClub,
};

