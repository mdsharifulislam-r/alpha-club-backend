import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import mongoose from 'mongoose';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { PartnerRequestService } from './partnerRequest.service';
import { USER_ROLES } from '../../../enums/user';

const create = catchAsync(async (req: Request, res: Response) => {

  const profileImage = getSingleFilePath(req.files, 'profileImage');

  const data = {
    ...req.body,
    profileImage
  }
  console.log(req.file)
  let result;

  if (req.user?.role === USER_ROLES.PARTNER || req.user?.role === USER_ROLES.USER) {
    result = await PartnerRequestService.createToDB(data);
  } else {
    result = await PartnerRequestService.createByAdminToDB(data);
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Partner Request submitted successfully',
    data: result,
  });
});

const createFrom = catchAsync(async (req: Request, res: Response) => {
  // const result = await MemberShipApplicationService.createFromDB(req.body);

  const image = getSingleFilePath(req.files, 'image');
  const logo = getSingleFilePath(req.files, 'logo');
  const data = {
    ...req.body,
    ...(logo && { logo }),
    ...(image && { image }),
  };

  console.log(data);
  const result = await PartnerRequestService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Partner Request submitted successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerRequestService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner Requests retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = new mongoose.Types.ObjectId((req.params as any)?.id);
  const result = await PartnerRequestService.getByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner Request retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params as any)?.id;
  const result = await PartnerRequestService.updateInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner Request updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = new mongoose.Types.ObjectId((req.params as any)?.id);
  const result = await PartnerRequestService.deleteFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Partner Request deleted successfully',
    data: result,
  });
});

export const PartnerRequestController = {
  create,
  createFrom,
  getAll,
  getById,
  update,
  remove,
};

