import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MemberRedemptionService } from './member-redemption.service';

/**
 * Create Redemption
 */
const create = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    creator: req?.user?.id
  };

  const result = await MemberRedemptionService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Redemption created successfully',
    data: result,
  });
});

/**
 * Get All Redemption
 */
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberRedemptionService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Redemption retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

/**
 * Get Redemption By ID
 */
const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberRedemptionService.getByIdFromDB(
    req.params?.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Redemption retrieved successfully',
    data: result,
  });
});

/**
 * Update Redemption
 */
const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id as string;

  const result = await MemberRedemptionService.updateInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Redemption updated successfully',
    data: result,
  });
});

/**
 * Delete Redemption
 */
const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberRedemptionService.deleteFromDB(
    req.params?.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Redemption deleted successfully',
    data: result,
  });
});

const redemptionOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberRedemptionService.redemptionOverview(req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Attendance overview retrieved successfully',
    data: result,
  });
});

export const MemberRedemptionController = {
  create,
  getAll,
  getById,
  update,
  remove,
  redemptionOverview
};