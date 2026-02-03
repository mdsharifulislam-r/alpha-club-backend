import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SponsorService } from './sponsor.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const logo = getSingleFilePath(req.files, 'logo');
  const data = {
    ...req.body,
    ...(logo && { logo }),
    ...(image && { image }),
  };

  const result = await SponsorService.createToDB(data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Sponsor created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorService.getAllFromDB(req.query,req?.user?.role);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sponsors retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorService.getByIdFromDB(req.params?.id as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sponsor retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const logo = getSingleFilePath(req.files, 'logo');
  const image = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    ...(logo && { logo }),
    ...(image && { image }),
  };

  const result = await SponsorService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sponsor updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorService.deleteFromDB(req.params?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sponsor deleted successfully',
    data: result,
  });
});

export const SponsorController = {
  create,
  getAll,
  getById,
  update,
  remove,
};

