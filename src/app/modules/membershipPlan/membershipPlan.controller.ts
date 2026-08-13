import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MemberShipPlanService } from './membershipPlan.service';
import { getSingleFilePath } from '../../../shared/getFilePath';
import mongoose from 'mongoose';

const create = catchAsync(async (req: Request, res: Response) => {
  const logo = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    ...(logo && { logo }),
  };

  const result = await MemberShipPlanService.createToDB(data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Membership plan created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  
  const result = await MemberShipPlanService.getAllFromDB(req.query,req?.user?.role);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership plans retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipPlanService.getByIdFromDB(req.params?.type as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership plan retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const type = req?.params?.type;
  const logo = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    ...(logo && { logo }),
  };
  const result = await MemberShipPlanService.updateInDB(type, data);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership plan updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipPlanService.deleteFromDB(req.params?.type);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Membership plan deleted successfully',
    data: result,
  });
});

const getFeatureComparison = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipPlanService.featureComparison();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feature comparison fetch successfully.',
    data: result,
  });
});

export const MemberShipPlanController = {
  create,
  getAll,
  getById,
  update,
  remove,
  getFeatureComparison
};

