import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EventRegistrationService } from './eventRegistration.service';
import sendResponse from '../../../../shared/sendResponse';
import catchAsync from '../../../../shared/catchAsync';

// No file/image handling here, registration doesn't require it by default

const create = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    user:req?.user?.id
  };

  const result = await EventRegistrationService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Event registration created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await EventRegistrationService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event registrations retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await EventRegistrationService.getByIdFromDB(req.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event registration retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const data = {
    ...req.body,
  };

  const result = await EventRegistrationService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event registration updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await EventRegistrationService.deleteFromDB(req.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event registration deleted successfully',
    data: result,
  });
});

const cancelEvent = catchAsync(async (req: Request, res: Response) => {
  const { event } = req.body;
  const userId = req?.user?.id;

  const result = await EventRegistrationService.cancelEvent({ event, user: userId });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event registration cancelled successfully',
    data: result,
  });
});

export const EventRegistrationController = {
  create,
  getAll,
  getById,
  update,
  remove,
  cancelEvent
};
