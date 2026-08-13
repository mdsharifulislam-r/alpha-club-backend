import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PartnerOfferService } from './partnerOffer.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await PartnerOfferService.createToDB(data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Partner offer created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerOfferService.getAllFromDB(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner offers retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerOfferService.getByIdFromDB(req.params?.id as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner offer retrieved successfully',
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
  
  const result = await PartnerOfferService.updateInDB(id, data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner offer updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerOfferService.deleteFromDB(req.params?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner offer deleted successfully',
    data: result,
  });
});

export const PartnerOfferController = {
  create,
  getAll,
  getById,
  update,
  remove,
};

