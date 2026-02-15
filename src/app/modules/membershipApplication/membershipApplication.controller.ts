import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MemberShipApplicationService } from './membershipApplication.service';
import mongoose from 'mongoose';
import { getSingleFilePath } from '../../../shared/getFilePath';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipApplicationService.createToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Membership application submitted successfully',
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
    const result = await MemberShipApplicationService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Membership application submitted successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipApplicationService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership applications retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = new mongoose.Types.ObjectId((req.params as any)?.id);
  const result = await MemberShipApplicationService.getByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership application retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params as any)?.id;
  const result = await MemberShipApplicationService.updateInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership application updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = new mongoose.Types.ObjectId((req.params as any)?.id);
  const result = await MemberShipApplicationService.deleteFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership application deleted successfully',
    data: result,
  });
});

export const MemberShipApplicationController = {
  create,
  createFrom,
  getAll,
  getById,
  update,
  remove,
};

