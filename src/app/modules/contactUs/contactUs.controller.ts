import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContactUsService } from './contactUs.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');

  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await ContactUsService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'ContactUs created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactUsService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'ContactUs retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactUsService.getByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'ContactUs retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const image = getSingleFilePath(req.files, 'image');

  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await ContactUsService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'ContactUs updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactUsService.deleteFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'ContactUs deleted successfully',
    data: result,
  });
});

export const ContactUsController = {
  create,
  getAll,
  getById,
  update,
  remove,
};

