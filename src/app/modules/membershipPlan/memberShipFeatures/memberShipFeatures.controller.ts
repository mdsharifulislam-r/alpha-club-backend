import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { MemberShipFeatureService } from './memberShipFeatures.service';
import mongoose from 'mongoose';
import { getSingleFilePath } from '../../../../shared/getFilePath';

const create = catchAsync( async (req: Request, res: Response, next) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data: any = {
      ...req.body,
      creator: user?.id,
    };

    if (image && image.length > 0) {
      data.icon = image;
    }

    const result = await MemberShipFeatureService.createToDB(data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Feature created successfully',
      data: result,
    });
  }
);

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipFeatureService.getAllFromDB(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Features retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = new mongoose.Types.ObjectId((req.params as any)?.id);
  const result = await MemberShipFeatureService.getByIdFromDB(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feature retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  let image = getSingleFilePath(req.files, 'image');

  const data: any = {
    ...req.body,
  };

  if (image && image.length > 0) {
    data.icon = image;
  }

  const result = await MemberShipFeatureService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feature updated successfully',
    data: result,
  });
});


const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberShipFeatureService.deleteFromDB(req?.params?.id as any);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feature deleted successfully',
    data: result,
  });
});

export const MemberShipFeatureController = {
  create,
  getAll,
  getById,
  update,
  remove,
};

