import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContactFormService } from './contactForm.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
  };

  const result = await ContactFormService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Contact form created successfully',
    data: result,
  });
});

const createForm = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
  };

  const result = await ContactFormService.createFormToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Contact form created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactFormService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contact forms retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactFormService.getByIdFromDB(req.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contact form retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const data = {
    ...req.body,
  };

  const result = await ContactFormService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contact form updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactFormService.deleteFromDB(req.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contact form deleted successfully',
    data: result,
  });
});

export const ContactFormController = {
  create,
  createForm,
  getAll,
  getById,
  update,
  remove,
};
