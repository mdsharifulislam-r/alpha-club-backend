import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventService } from './event.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await EventService.createToDB(data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Event created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getAllFromDB(req.query ,req?.user?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Events retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getByIdFromDB(req.params?.id as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event retrieved successfully',
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
  
  const result = await EventService.updateInDB(id, data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.deleteFromDB(req.params?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

export const EventController = {
  create,
  getAll,
  getById,
  update,
  remove,
};

